import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Hospital } from '@shared/schema';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  MapPin, Phone, Mail, Clock, User, Calendar, Star, 
  Building, Search, Filter, X, ChevronRight, 
  HeartPulse, Stethoscope, CheckCircle 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // List of Kenyan counties
  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Nyeri', 'Kakamega', 'Meru', 'Kisii', 'Garissa', 'Machakos'
  ];

  // Common medical specialties
  const specialties = [
    'General Medicine', 'Pediatrics', 'Surgery', 'Obstetrics & Gynecology',
    'Orthopedics', 'Cardiology', 'Neurology', 'Dermatology', 'Ophthalmology',
    'ENT', 'Dental', 'Emergency Medicine'
  ];

  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, selectedCounty, selectedSpecialty]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('query', searchQuery);
      if (selectedCounty) queryParams.append('county', selectedCounty);
      if (selectedSpecialty) queryParams.append('specialty', selectedSpecialty);

      const response = await fetch(`/api/hospitals/search?${queryParams}`);
      const data = await response.json();

      if (data.hospitals) {
        setHospitals(data.hospitals);
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to fetch hospitals',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch hospitals',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = async (hospital: Hospital) => {
    try {
      const response = await fetch(`/api/hospitals/${hospital.id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedHospital(data.hospital);
        setShowHospitalDetails(true);
        fetchDoctorSchedules(hospital.id);
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to fetch hospital details',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch hospital details',
        variant: "destructive",
      });
    }
  };

  const handleBookAppointment = async (scheduleId: string) => {
    console.log('Current user:', user); // Debug log
    
    if (!user || !user.id) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (user.role !== 'patient' && user.role !== 'user') {
      console.log('User role is not allowed to book, current role:', user.role);
      toast({
        title: "Cannot book appointment",
        description: "Only patients can book appointments. Please log in as a patient.",
        variant: "destructive",
      });
      return;
    }

    console.log('User is authenticated and is a patient, proceeding with booking');
    navigate(`/booking/${scheduleId}`);
    console.log('Navigating to booking page with path:', `/booking/${scheduleId}`);
  };

  const fetchDoctorSchedules = async (hospitalId) => {
    try {
      setLoadingSchedules(true);
      const response = await fetch(`/api/hospitals/${hospitalId}/schedules`);
      if (response.ok) {
        const data = await response.json();
        setDoctorSchedules(data.schedules);
      } else {
        console.error('Failed to fetch doctor schedules');
        setDoctorSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      setDoctorSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedSpecialty('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Find Healthcare Facilities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover top-rated hospitals and clinics near you. Book appointments with specialized healthcare providers.
          </p>
          
          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Search</label>
                <div className="relative">
                  <Input
                    placeholder="Search hospitals by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">County</label>
                <Select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <option value="">All Counties</option>
                  {counties.map((county, index) => (
                    <option key={index} value={county}>{county}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Specialty</label>
                <Select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty, index) => (
                    <option key={index} value={specialty}>{specialty}</option>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* Active Filters */}
            {(selectedCounty || selectedSpecialty || searchQuery) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 py-1 px-3">
                    Search: {searchQuery}
                    <button className="ml-2" onClick={() => setSearchQuery('')}>×</button>
                  </Badge>
                )}
                {selectedCounty && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 py-1 px-3">
                    County: {selectedCounty}
                    <button className="ml-2" onClick={() => setSelectedCounty('')}>×</button>
                  </Badge>
                )}
                {selectedSpecialty && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 py-1 px-3">
                    Specialty: {selectedSpecialty}
                    <button className="ml-2" onClick={() => setSelectedSpecialty('')}>×</button>
                  </Badge>
                )}
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : hospitals.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {hospitals.length} {hospitals.length === 1 ? 'Facility' : 'Facilities'} Found
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {hospitals.map((hospital) => (
                <div 
                  key={hospital.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1"
                >
                  {/* Hospital Header */}
                  <div className="p-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <h2 className="text-xl font-bold">{hospital.name}</h2>
                  </div>
                  
                  {/* Hospital Content */}
                  <div className="p-5">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                          <p className="text-gray-800 dark:text-white">{hospital.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                          <p className="text-gray-800 dark:text-white">{hospital.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                          <p className="text-gray-800 dark:text-white">{hospital.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hours</h3>
                          <p className="text-gray-800 dark:text-white">{hospital.openHours}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hospital Specialties */}
                    {hospital.specialties && hospital.specialties.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                          {hospital.specialties.slice(0, 3).map((specialty, i) => (
                            <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <Badge className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                              +{hospital.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button 
                        onClick={() => handleHospitalClick(hospital)}
                        className="bg-white hover:bg-gray-50 text-primary-600 border border-primary-200 hover:border-primary-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-primary-400 dark:border-primary-800"
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handleBookAppointment(hospital.id)}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-12 text-center">
            <Alert className="bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300">
              <AlertDescription className="text-lg">No hospitals found matching your criteria.</AlertDescription>
            </Alert>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Try adjusting your search or filters to see more results.</p>
          </div>
        )}

        {/* Hospital Details Dialog */}
        <Dialog open={showHospitalDetails} onOpenChange={setShowHospitalDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedHospital?.name}</DialogTitle>
              {selectedHospital?.address && (
                <DialogDescription className="flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" /> {selectedHospital.address}
                </DialogDescription>
              )}
            </DialogHeader>
            
            {selectedHospital && (
              <div className="mt-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="doctors">Doctors & Schedules</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex">
                            <Phone className="w-5 h-5 mr-2 text-primary-500" />
                            <span>{selectedHospital.phone}</span>
                          </div>
                          <div className="flex">
                            <Mail className="w-5 h-5 mr-2 text-primary-500" />
                            <span>{selectedHospital.email}</span>
                          </div>
                          <div className="flex">
                            <Clock className="w-5 h-5 mr-2 text-primary-500" />
                            <span>{selectedHospital.openHours}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedHospital.specialties?.map((specialty, index) => (
                            <Badge key={index} className="bg-blue-50 text-blue-700">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">About</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedHospital.description || 'No description available for this facility.'}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Facilities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedHospital.facilities?.map((facility, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            <span>{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="doctors">
                    {loadingSchedules ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                      </div>
                    ) : doctorSchedules.length > 0 ? (
                      <div className="space-y-6">
                        {doctorSchedules.map((schedule, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div className="mb-4 md:mb-0">
                                <div className="flex items-center mb-2">
                                  <User className="w-5 h-5 mr-2 text-primary-500" />
                                  <h4 className="text-lg font-semibold">{schedule.doctorName}</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                  {schedule.specialty}
                                </p>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                  <span className="text-sm">
                                    Available on {getDayName(schedule.dayOfWeek)} at {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleBookAppointment(schedule.id)}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                              >
                                Book Appointment
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No doctor schedules available for this hospital.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Patient Reviews</h3>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-500 mr-1" />
                          <span className="font-bold">{selectedHospital.rating || '4.5'}</span>
                          <span className="text-gray-500 ml-1">({selectedHospital.reviewCount || '27'} reviews)</span>
                        </div>
                      </div>
                      
                      {/* Sample reviews - would be replaced with actual data */}
                      <div className="space-y-4">
                        <Card className="p-4">
                          <div className="flex items-start">
                            <div className="mr-3 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-bold">JD</span>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <h4 className="font-semibold mr-2">John Doe</h4>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= 5 ? 'text-yellow-500' : 'text-gray-300'}`}
                                      fill={star <= 5 ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                Excellent service and friendly staff. The doctors were very professional and knowledgeable.
                              </p>
                              <p className="text-sm text-gray-500 mt-1">Posted 2 months ago</p>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-4">
                          <div className="flex items-start">
                            <div className="mr-3 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-bold">MS</span>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <h4 className="font-semibold mr-2">Mary Smith</h4>
                                <div className="flex">
                                  {[1, 2, 3, 4].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= 4 ? 'text-yellow-500' : 'text-gray-300'}`}
                                      fill={star <= 4 ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                  <Star className="w-4 h-4 text-gray-300" />
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                The wait time was a bit long, but the medical care was top notch. Clean facilities and good follow-up.
                              </p>
                              <p className="text-sm text-gray-500 mt-1">Posted 1 month ago</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
