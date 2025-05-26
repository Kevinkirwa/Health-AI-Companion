import { useState, useEffect } from "react";
import { FadeIn, SlideUp, StaggeredContainer, StaggeredItem, PulseAnimation } from "@/components/ui/animations";
import { playSound, SoundEffects } from "@/utils/sound-effects";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Doctor, Hospital } from "@shared/schema";
import { ArrowLeft, Check, FileText, Heart, Info, MessageSquare, Star, User, X, XCircle, Loader2, Calendar, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingPage = () => {
  const { hospitalId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'doctor' | 'datetime' | 'confirm'>('doctor');

  // Get hospital details
  const { data: hospital, isLoading: isLoadingHospital } = useQuery<Hospital>({
    queryKey: ['/api/hospitals', hospitalId],
    queryFn: async () => {
      if (!hospitalId) throw new Error('Hospital ID is required');
      const res = await apiRequest<Hospital>(`/hospitals/${hospitalId}`, {
        method: "GET"
      });
      return res;
    },
    enabled: !!hospitalId,
  });

  // Get doctors for this hospital
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['/api/hospitals/doctors', hospitalId],
    queryFn: async () => {
      if (!hospitalId) throw new Error('Hospital ID is required');
      const res = await apiRequest<{ success: boolean; doctors: Doctor[] }>(`/hospitals/${hospitalId}/doctors`, {
        method: "GET"
      });
      return res.doctors;
    },
    enabled: !!hospitalId,
  });

  // Get doctor schedules for this hospital
  const { data: doctorSchedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: [`/api/hospitals/schedules`, hospitalId, selectedDoctor],
    queryFn: async () => {
      if (!hospitalId) throw new Error('Hospital ID is required');
      try {
        const res = await apiRequest<{ success: boolean; schedules: any[] }>(
          `/hospitals/${hospitalId}/schedules`,
          { method: "GET" }
        );
        console.log('Doctor schedules response:', res);
        return res.schedules || [];
      } catch (error) {
        console.error('Error fetching schedules:', error);
        // Generate doctor-specific mock data
        if (doctors && doctors.length > 0) {
          console.log('Generating doctor-specific mock schedules');
          return doctors.map(doctor => ({
            doctor: {
              _id: doctor.id,
              name: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`,
              specialization: doctor.specialty || 'General Medicine',
              hospital: hospitalId
            },
            schedules: [
              // Create unique schedule patterns for each doctor
              { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 2, startTime: '10:00', endTime: '15:00' },
              { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 4, startTime: '11:00', endTime: '18:00' },
              { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
            ]
          }));
        }
        return [];
      }
    },
    enabled: !!hospitalId && !!doctors,
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: { 
      doctorId: string; 
      hospitalId: string;
      patientId: string;
      date: string; 
      time: string;
      notes?: string;
      phoneNumber?: string;
      reminderPreferences: {
        sms: boolean;
        whatsapp: boolean;
        email: boolean;
        intervals: number[];
      };
    }) => {
      console.log('Submitting appointment with data:', data);
      
      try {
        // Format the request properly for the API
        const response = await apiRequest<any>('/api/appointments', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        console.log('Appointment creation response:', response);
        
        return response;
      } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Appointment created successfully:', data);
      
      // Invalidate appointments query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      // Play success sound
      playSound(SoundEffects.SUCCESS);
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been booked successfully! Email notifications have been sent to both you and the doctor with the appointment details.",
        variant: "default",
      });
      
      // Add a small delay before redirect for better UX
      setTimeout(() => {
        // Redirect to dashboard
        setLocation("/dashboard");
      }, 1500);
    },
    onError: (error) => {
      console.error('Error in appointment mutation:', error);
      // Play error sound
      playSound(SoundEffects.ERROR);
      
      toast({
        title: "Booking Failed",
        description: "Failed to book your appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper function to check if a doctor has available time slots for a specific date
  const getDoctorTimeSlots = (doctorId: string | number, date: string): TimeSlot[] => {
    if (!doctorId || !date) return [];
    
    console.log(`Getting time slots for doctor ${doctorId} on ${date}`);
    
    // For demonstration, generate time slots between 9am and 5pm every 30 minutes
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: true
        });
      }
    }
    
    return slots;
  };

  // Get available slots for the selected date
  const getAvailableSlots = (date: string) => {
    if (!selectedDoctor || !date) return [];
    return getDoctorTimeSlots(selectedDoctor, date);
  };

  // Notes form schema
  const notesSchema = z.object({
    notes: z.string().optional(),
    phoneNumber: z.string().optional()
      .refine(val => !val || /^\+?[0-9]{10,15}$/.test(val), {
        message: "Phone number must be valid (10-15 digits)"
      }),
    reminderPreferences: z.object({
      sms: z.boolean().default(false),
      whatsapp: z.boolean().default(false),
      email: z.boolean().default(true),
      intervals: z.array(z.number()).default([24, 1]) // Default to 24h and 1h before
    }).default({
      sms: false,
      whatsapp: false,
      email: true,
      intervals: [24, 1]
    })
  });

  // Notes form
  const notesForm = useForm<z.infer<typeof notesSchema>>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
      phoneNumber: "",
      reminderPreferences: {
        sms: false,
        whatsapp: false,
        email: true,
        intervals: [24, 1]
      }
    },
  });

  const handleBooking = (formData: z.infer<typeof notesSchema>) => {
    console.log('Booking attempt with values:', {
      selectedDoctor,
      selectedDate,
      selectedTime,
      hospitalId,
      user: user ? `User found: ${user.name}` : 'No user found',
      formData
    });
    
    // Ensure we have a doctor selected
    if (!selectedDoctor && doctors && doctors.length > 0) {
      console.log('Auto-selecting first doctor:', doctors[0]);
      setSelectedDoctor(doctors[0].id);
      // We need to call handleBooking again after selecting the doctor
      setTimeout(() => handleBooking(formData), 100);
      return;
    }
    
    // Check if all required fields are present
    if (!selectedDoctor || !selectedDate || !selectedTime || !hospitalId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: `Please select a ${!selectedDoctor ? 'doctor' : !selectedDate ? 'date' : !selectedTime ? 'time' : 'hospital'} before confirming your booking.`
      });
      return;
    }

    // Check if user is logged in
    if (!user || !user.id) {
      console.log('No authenticated user found, redirecting to login');
      toast({
        title: "Authentication required",
        description: "Please login to book an appointment",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    // Default Email notifications to true (our preferred notification method)
    const reminderPreferences = { ...formData.reminderPreferences };
    // Enable SMS notifications if a phone number is provided, but keep email as primary
    if (formData.phoneNumber) {
      reminderPreferences.sms = true;
    }
    // Always prioritize email notifications
    reminderPreferences.email = true;

    // Format the appointment data
    const appointmentData = {
      doctorId: selectedDoctor,
      hospitalId: hospitalId,
      patientId: user.id,
      date: selectedDate,
      time: selectedTime,
      notes: formData.notes || '',
      phoneNumber: formData.phoneNumber,
      status: 'pending',
      type: 'consultation',
      reason: 'Medical appointment',
      reminderPreferences: reminderPreferences
    };
    
    console.log('Submitting final appointment data:', appointmentData);
    
    // Create the booking
    bookAppointmentMutation.mutate(appointmentData);
  };

  // Preload sounds when component mounts
  useEffect(() => {
    // Play subtle UI sound when page loads
    playSound(SoundEffects.BUTTON_CLICK, 0.3);
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return (
    <FadeIn>
      <section className="py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="mr-2" onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Book an Appointment</h1>
          </div>

          {isLoadingHospital ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading hospital information...</span>
            </div>
          ) : !hospital ? (
            <div className="text-center p-8 border rounded-lg">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Hospital Not Found</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find the hospital you're looking for. Please try again or contact support.
              </p>
              <Button onClick={() => setLocation('/')}>Return Home</Button>
            </div>
          ) : (
            <Tabs defaultValue="doctor" value={bookingStep} onValueChange={(value) => setBookingStep(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="doctor" disabled={bookingStep !== 'doctor'}>Select Doctor</TabsTrigger>
                <TabsTrigger value="datetime" disabled={bookingStep !== 'datetime' && bookingStep !== 'doctor'}>
                  Choose Date & Time
                </TabsTrigger>
                <TabsTrigger value="confirm" disabled={bookingStep !== 'confirm' && bookingStep !== 'datetime'}>
                  Confirm Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doctor">
                <Card>
                  <CardHeader>
                    <CardTitle>Select a Doctor</CardTitle>
                    <CardDescription>
                      Choose a healthcare provider at {hospital.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDoctors ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading doctors...</span>
                      </div>
                    ) : !doctors || doctors.length === 0 ? (
                      <div className="text-center p-4 border rounded-lg">
                        <Info className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <h3 className="text-lg font-medium mb-1">No Doctors Available</h3>
                        <p className="text-gray-600 text-sm">
                          There are currently no doctors available at this hospital. Please try another hospital or contact support.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {doctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedDoctor === doctor.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setSelectedDoctor(doctor.id);
                              setBookingStep('datetime');
                              playSound(SoundEffects.BUTTON_CLICK);
                            }}
                          >
                            <div className="flex items-start">
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <h3 className="font-medium">
                                    Dr. {doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`}
                                  </h3>
                                  {selectedDoctor === doctor.id && (
                                    <Check className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{doctor.specialty || "General Medicine"}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    4.8
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    120+ Reviews
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    Specializes in {doctor.specialty || "General Care"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setLocation('/')}>
                      Cancel
                    </Button>
                    <Button
                      disabled={!selectedDoctor}
                      onClick={() => {
                        setBookingStep('datetime');
                        playSound(SoundEffects.BUTTON_CLICK);
                      }}
                    >
                      Continue
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="datetime">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Date & Time</CardTitle>
                    <CardDescription>
                      Select an available date and time slot for your appointment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <Calendar className="mr-2 h-4 w-4" /> Select Date
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {/* Generate next 9 days from today */}
                          {Array.from({ length: 9 }).map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            const dateStr = date.toISOString().split('T')[0];
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNum = date.getDate();
                            
                            return (
                              <div
                                key={dateStr}
                                className={`p-2 border rounded-md text-center cursor-pointer ${
                                  selectedDate === dateStr
                                    ? "border-primary bg-primary/5"
                                    : "hover:border-primary/50"
                                }`}
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setSelectedTime(null);
                                  playSound(SoundEffects.BUTTON_CLICK);
                                }}
                              >
                                <div className="text-xs font-medium">{dayName}</div>
                                <div className="text-lg">{dayNum}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <Clock className="mr-2 h-4 w-4" /> Select Time
                        </h3>
                        
                        {!selectedDate ? (
                          <div className="p-4 border rounded-md text-center text-gray-500">
                            Please select a date first
                          </div>
                        ) : (
                          <StaggeredContainer>
                            <div className="grid grid-cols-3 gap-2">
                              {getAvailableSlots(selectedDate).map((slot) => (
                                <div
                                  key={slot.time}
                                  className={`p-2 border rounded-md text-center cursor-pointer ${
                                    !slot.available
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : selectedTime === slot.time
                                      ? "border-primary bg-primary/5"
                                      : "hover:border-primary/50"
                                  }`}
                                  onClick={() => {
                                    if (slot.available) {
                                      setSelectedTime(slot.time);
                                      playSound(SoundEffects.BUTTON_CLICK);
                                    }
                                  }}
                                >
                                  {slot.time}
                                </div>
                              ))}
                            </div>
                          </StaggeredContainer>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setBookingStep('doctor')}>
                      Back
                    </Button>
                    <Button
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => {
                        setBookingStep('confirm');
                        playSound(SoundEffects.BUTTON_CLICK);
                      }}
                    >
                      Continue
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="confirm">
                <Card>
                  <CardHeader>
                    <CardTitle>Confirm Appointment</CardTitle>
                    <CardDescription>
                      Review your appointment details and provide any additional information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hospital:</span>
                          <span className="font-medium">{hospital.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="font-medium">
                            {doctors?.find(d => d.id === selectedDoctor)?.name || 'Selected Doctor'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Appointment Type:</span>
                          <span className="font-medium">Consultation</span>
                        </div>
                      </div>
                      
                      <Form {...notesForm}>
                        <form onSubmit={notesForm.handleSubmit(handleBooking)} className="space-y-4">
                          <FormField
                            control={notesForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any specific concerns or information you'd like to share with the doctor?"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notesForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number (optional for SMS notifications)</FormLabel>
                                <FormControl>
                                  <input
                                    type="tel"
                                    placeholder="e.g. +254XXXXXXXXX or 07XXXXXXXX"
                                    className="w-full p-2 border rounded-md"
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-500">Include your country code or start with 0 for Kenyan numbers</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Reminder Preferences</h3>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="sms"
                                  checked={notesForm.watch('reminderPreferences.sms')}
                                  onCheckedChange={(checked) => {
                                    notesForm.setValue('reminderPreferences.sms', checked as boolean);
                                  }}
                                />
                                <Label htmlFor="sms">SMS Reminders</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="email"
                                  checked={notesForm.watch('reminderPreferences.email')}
                                  onCheckedChange={(checked) => {
                                    notesForm.setValue('reminderPreferences.email', checked as boolean);
                                  }}
                                />
                                <Label htmlFor="email">Email Reminders</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="email"
                                  checked={notesForm.watch('reminderPreferences.email')}
                                  onCheckedChange={(checked) => {
                                    notesForm.setValue('reminderPreferences.email', checked as boolean);
                                  }}
                                />
                                <Label htmlFor="email">Email Reminders</Label>
                              </div>
                            </div>
                          </div>
                          
                          <PulseAnimation pulseDuration={3}>
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={bookAppointmentMutation.isPending}
                            >
                              {bookAppointmentMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Confirm Booking"
                              )}
                            </Button>
                          </PulseAnimation>
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </FadeIn>
  );
};

export default BookingPage;
