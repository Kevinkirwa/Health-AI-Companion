import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Hospital } from '@shared/schema';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MapPin, Phone, Mail, Clock, User, Calendar } from 'lucide-react';
import { WhatsAppTest } from '../components/WhatsAppTest';
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
        toast.error(data.message || 'Failed to fetch hospitals');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to fetch hospitals');
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
        toast.error(data.message || 'Failed to fetch hospital details');
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast.error('Failed to fetch hospital details');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Hospitals</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          >
            <option value="">All Counties</option>
            {counties.map((county, index) => (
              <option key={index} value={county}>{county}</option>
            ))}
          </Select>
          <Select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty, index) => (
              <option key={index} value={specialty}>{specialty}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <WhatsAppTest />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : hospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="p-4">
              <h2 className="text-xl font-semibold mb-2">{hospital.name}</h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {hospital.address}
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {hospital.phone}
                </p>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {hospital.email}
                </p>
                <p className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {hospital.openHours}
                </p>
              </div>
              <div className="mt-4 flex justify-between">
                <Button onClick={() => handleHospitalClick(hospital)}>
                  View Details
                </Button>
                <Button onClick={() => handleBookAppointment(hospital.id)}>
                  Book Appointment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>No hospitals found matching your criteria.</AlertDescription>
        </Alert>
      )}

      <Dialog open={showHospitalDetails} onOpenChange={setShowHospitalDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedHospital?.name}</DialogTitle>
          </DialogHeader>
          {selectedHospital && (
            <div className="space-y-4">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Hospital Info</TabsTrigger>
                  <TabsTrigger value="doctors">Doctor Schedules</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedHospital.address}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact</h3>
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedHospital.phone}
                    </p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedHospital.email}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Opening Hours</h3>
                    <p className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedHospital.openHours}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHospital.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="doctors" className="space-y-4 pt-4">
                  <h3 className="font-semibold text-lg mb-4">Available Doctors</h3>
                  
                  {loadingSchedules ? (
                    <div className="text-center py-4">Loading doctor schedules...</div>
                  ) : doctorSchedules.length > 0 ? (
                    <div className="space-y-6">
                      {doctorSchedules.map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              {item.doctor.profilePicture ? (
                                <img 
                                  src={item.doctor.profilePicture} 
                                  alt={item.doctor.name} 
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.doctor.name}</h4>
                              <p className="text-sm text-gray-600">{item.doctor.specialization}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <h5 className="font-medium text-sm mb-2">Available Schedule:</h5>
                            <div className="grid grid-cols-1 gap-2">
                              {item.schedules.map((schedule, idx) => (
                                <div key={idx} className="flex items-center border-b pb-2">
                                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                  <span className="font-medium mr-2">{getDayName(schedule.dayOfWeek)}:</span>
                                  <span>
                                    {schedule.startTime} - {schedule.endTime}
                                    {schedule.breakStart && schedule.breakEnd && 
                                      ` (Break: ${schedule.breakStart} - ${schedule.breakEnd})`}
                                  </span>
                                  {!schedule.isAvailable && (
                                    <Badge variant="destructive" className="ml-2">Unavailable</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Button 
                            className="mt-4" 
                            onClick={() => handleBookAppointment(item.schedules[0]._id)}
                          >
                            {user ? 'Book Appointment' : 'Login to Book'}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-md bg-gray-50">
                      <p>No doctor schedules available for this hospital.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-between mt-6">
                <Button onClick={() => handleBookAppointment(selectedHospital.id)}>
                  {user ? 'Book Appointment' : 'Login to Book'}
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    onClick={() => handleSaveHospital(selectedHospital.id)}
                  >
                    {isSaved(selectedHospital.id) ? 'Unsave' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
