import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Doctor, Hospital } from "@shared/schema";
import { Loader2, Calendar, Clock, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingPage = () => {
  const { hospitalId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'doctor' | 'datetime' | 'confirm'>('doctor');

  // Get hospital details
  const { data: hospital, isLoading: isLoadingHospital } = useQuery<Hospital>({
    queryKey: [`/api/hospitals/${hospitalId}`],
    queryFn: async () => {
      const res = await fetch(`/api/hospitals/${hospitalId}`);
      if (!res.ok) throw new Error("Failed to fetch hospital details");
      return res.json();
    },
    enabled: !!hospitalId,
  });

  // Get doctors for this hospital
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: [`/api/doctors/hospital/${hospitalId}`],
    queryFn: async () => {
      const res = await fetch(`/api/doctors/hospital/${hospitalId}`);
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return res.json();
    },
    enabled: !!hospitalId,
  });

  // Generate time slots
  const generateTimeSlots = (doctorId: number, date: string): TimeSlot[] => {
    // In a real app, this would fetch from the API based on doctor availability
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: Math.random() > 0.3, // Random availability for demo
        });
      }
    }
    
    return slots;
  };

  // Get available dates
  const getAvailableDates = (): string[] => {
    // Generate dates for the next 7 days
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      dates.push(formattedDate);
    }
    
    return dates;
  };

  // Notes form schema
  const notesSchema = z.object({
    notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  });

  // Notes form
  const notesForm = useForm<z.infer<typeof notesSchema>>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: { 
      doctorId: number; 
      hospitalId: number; 
      date: string; 
      time: string;
      notes?: string;
    }) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully booked.",
      });
      // Redirect to dashboard after successful booking
      window.location.href = "/dashboard";
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Failed to book your appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle booking submission
  const handleBooking = (formData: z.infer<typeof notesSchema>) => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !hospitalId) {
      toast({
        title: "Incomplete Booking",
        description: "Please select a doctor, date, and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    bookAppointmentMutation.mutate({
      doctorId: selectedDoctor,
      hospitalId: parseInt(hospitalId),
      date: selectedDate,
      time: selectedTime,
      notes: formData.notes,
    });
  };

  // If not logged in, redirect to auth page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If hospital ID is not provided, redirect to hospitals page
  if (!hospitalId) {
    return <Redirect to="/hospitals" />;
  }

  // Loading state
  if (isLoadingHospital || isLoadingDoctors) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // If hospital not found
  if (!hospital) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Hospital not found</p>
          <Button asChild>
            <a href="/hospitals">Find Hospitals</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Book an Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {hospital.name} - {hospital.address}
            </p>
          </div>

          <Tabs 
            defaultValue="doctor" 
            value={bookingStep}
            onValueChange={(value) => setBookingStep(value as any)}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="doctor" disabled={bookingStep !== 'doctor'}>Select Doctor</TabsTrigger>
              <TabsTrigger value="datetime" disabled={!selectedDoctor || bookingStep === 'doctor'}>
                Choose Date & Time
              </TabsTrigger>
              <TabsTrigger value="confirm" disabled={!selectedTime || bookingStep !== 'confirm'}>
                Confirm Booking
              </TabsTrigger>
            </TabsList>
            
            {/* Step 1: Select Doctor */}
            <TabsContent value="doctor">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Doctor</CardTitle>
                  <CardDescription>
                    Choose from available doctors at {hospital.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors && doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <Card 
                          key={doctor.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedDoctor === doctor.id ? 'border-2 border-primary-500' : ''
                          }`}
                          onClick={() => setSelectedDoctor(doctor.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                                
                                {doctor.rating && (
                                  <div className="flex items-center mt-2">
                                    <div className="flex text-yellow-400 mr-1">
                                      {[...Array(Math.floor(doctor.rating))].map((_, i) => (
                                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                      ))}
                                      {doctor.rating % 1 >= 0.5 && (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {doctor.rating.toFixed(1)}
                                    </span>
                                  </div>
                                )}

                                {doctor.bio && (
                                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    {doctor.bio.slice(0, 100)}{doctor.bio.length > 100 ? '...' : ''}
                                  </p>
                                )}
                              </div>
                              
                              {selectedDoctor === doctor.id && (
                                <div className="h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          No doctors available at this hospital.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    disabled={!selectedDoctor} 
                    onClick={() => setBookingStep('datetime')}
                  >
                    Next: Choose Date & Time
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Step 2: Choose Date & Time */}
            <TabsContent value="datetime">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Date & Time</CardTitle>
                  <CardDescription>
                    Select when you'd like to schedule your appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select Date</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {getAvailableDates().map((date) => {
                          const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          });
                          
                          return (
                            <Button
                              key={date}
                              variant={selectedDate === date ? "default" : "outline"}
                              className="h-auto py-3 flex flex-col"
                              onClick={() => setSelectedDate(date)}
                            >
                              <span>{formattedDate.split(',')[0]}</span>
                              <span>{formattedDate.split(',')[1]}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select Time</h3>
                      {selectedDate ? (
                        <div className="grid grid-cols-3 gap-2">
                          {generateTimeSlots(selectedDoctor!, selectedDate).map((slot) => (
                            <Button
                              key={slot.time}
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              className={!slot.available ? "opacity-50 cursor-not-allowed" : ""}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          Please select a date first
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setBookingStep('doctor')}
                  >
                    Back: Choose Doctor
                  </Button>
                  <Button 
                    disabled={!selectedDate || !selectedTime} 
                    onClick={() => setBookingStep('confirm')}
                  >
                    Next: Confirm Booking
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Step 3: Confirm Booking */}
            <TabsContent value="confirm">
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Your Appointment</CardTitle>
                  <CardDescription>
                    Review your appointment details before confirming
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hospital</h3>
                        <p className="font-medium">{hospital.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{hospital.address}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Doctor</h3>
                        <p className="font-medium">
                          {doctors?.find(d => d.id === selectedDoctor)?.name || `Doctor #${selectedDoctor}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {doctors?.find(d => d.id === selectedDoctor)?.specialty || 'Specialist'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</h3>
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {selectedTime}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Form {...notesForm}>
                        <form className="space-y-4">
                          <FormField
                            control={notesForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Briefly describe your symptoms or reason for visit..." 
                                    className="min-h-32" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setBookingStep('datetime')}
                  >
                    Back: Choose Date & Time
                  </Button>
                  <Button 
                    onClick={() => handleBooking(notesForm.getValues())}
                    disabled={bookAppointmentMutation.isPending}
                  >
                    {bookAppointmentMutation.isPending ? "Booking..." : "Confirm Appointment"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default BookingPage;
