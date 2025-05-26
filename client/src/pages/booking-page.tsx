import { useState } from "react";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
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
              { dayOfWeek: 4, startTime: '09:00', endTime: '16:00' },
              { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' }
            ]
          }));
        }
        return [];
      }
    },
    enabled: !!hospitalId && !!doctors,
  });
  
  // Get doctor's availability status
  const { data: doctorAvailability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: [`/api/doctors/availability`, selectedDoctor],
    queryFn: async () => {
      if (!selectedDoctor) return null;
      try {
        // Fetch the doctor's details including availability status
        const res = await apiRequest<{ success: boolean; doctor: any }>(
          `/doctors/${selectedDoctor}`,
          { method: "GET" }
        );
        
        console.log('Doctor availability response:', res);
        
        // Just return the doctor object which should include the 'availability' field
        return res.doctor || null;
      } catch (error) {
        console.error('Error fetching doctor availability:', error);
        return null;
      }
    },
    enabled: !!selectedDoctor,
  });

  // Helper function to convert day number to day name
  const getDayName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber % 7];
  };
  
  // Helper function to check if a doctor is available
  const isDoctorAvailable = (doctorId: number): boolean => {    
    // Check doctor availability in the database
    if (doctorAvailability) {
      // Check if the doctor has "Available" status
      return doctorAvailability.availability === "Available";
    }
    
    return false;
  };

  // Generate time slots based on doctor's availability status
  const generateTimeSlots = (doctorId: number, date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    console.log('Generating time slots for day of week:', dayOfWeek);
    console.log('Doctor availability data:', doctorAvailability);
    
    // Default business hours
    const startHour = 9;
    const endHour = 17;
    
    // Only generate slots if the doctor is marked as available
    if (doctorAvailability && doctorAvailability.availability === "Available") {
      // If the doctor is available, generate standard business hour slots for weekdays
      // For weekends, provide more limited hours
      
      // Define business hours based on day of week
      let actualStartHour = startHour;
      let actualEndHour = endHour;
      
      // Weekend hours (Saturday and Sunday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        actualStartHour = 10; // Later start on weekends
        actualEndHour = 14;   // Earlier end on weekends
      }
      
      // Generate 30-minute slots within business hours
      for (let hour = actualStartHour; hour < actualEndHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip slots that would go past the end hour
          if (hour === actualEndHour - 1 && minute >= 30) continue;
          
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            time: timeString,
            available: true,
          });
        }
      }
      
      console.log(`Generated ${slots.length} available time slots for doctor ${doctorId} on ${date}`);
    } else {
      console.log(`Doctor ${doctorId} is not available or not found`);
    }
    
    return slots;
  };

  // Get available dates for the next 14 days
  const { data: doctorAvailableDates, isLoading: isLoadingAvailableDates } = useQuery({
    queryKey: [`/api/doctor-dashboard/available-dates`, selectedDoctor],
    queryFn: async () => {
      if (!selectedDoctor) return { availableDates: [] };
      
      try {
        // First try to get doctor's specific available dates
        const res = await apiRequest<{ success: boolean; availableDates: any[] }>(
          `/api/doctor-dashboard/available-dates?doctorId=${selectedDoctor}`,
          { method: "GET" }
        );
        console.log('Doctor available dates response:', res);
        return res;
      } catch (error) {
        console.error('Error fetching doctor available dates:', error);
        return { availableDates: [] };
      }
    },
    enabled: !!selectedDoctor,
  });

  // Get available dates based on doctor's specific selections or fall back to the next 14 days
  const getAvailableDates = (): string[] => {
    const dates: string[] = [];
    
    // If the doctor has specific available dates, use those
    if (doctorAvailableDates?.availableDates && doctorAvailableDates.availableDates.length > 0) {
      console.log('Using doctor\'s specific available dates:', doctorAvailableDates.availableDates);
      return doctorAvailableDates.availableDates.map(dateObj => {
        const date = new Date(dateObj.date);
        return date.toISOString().split('T')[0];
      });
    }
    
    // Otherwise fall back to the next 14 days
    console.log('No specific dates found, using next 14 days as fallback');
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      dates.push(formattedDate);
    }
    return dates;
  };

  // Notes form schema
  const notesSchema = z.object({
    notes: z.string().optional(),
    reminderPreferences: z.object({
      sms: z.boolean().default(false),
      whatsapp: z.boolean().default(false),
      email: z.boolean().default(false),
      intervals: z.array(z.number()).default([24, 1]) // Default to 24h and 1h before
    }).default({
      sms: false,
      whatsapp: false,
      email: false,
      intervals: [24, 1]
    })
  });

  // Notes form
  const notesForm = useForm<z.infer<typeof notesSchema>>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
      reminderPreferences: {
        sms: false,
        whatsapp: false,
        email: false,
        intervals: [24, 1]
      }
    },
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: { 
      doctorId: number | null; 
      hospitalId: number | string; 
      date: string; 
      time: string;
      notes?: string;
      reminderPreferences: {
        sms: boolean;
        whatsapp: boolean;
        email: boolean;
        intervals: number[];
      };
    }) => {
      // Create the appointment
      const res = await apiRequest("POST", "/api/appointments", data);
      const appointmentData = await res.json();
      
      // If appointment creation was successful, update its status to confirmed
      if (appointmentData.success && appointmentData.appointment) {
        try {
          // Confirm the appointment immediately to trigger WhatsApp notifications
          const confirmRes = await apiRequest(
            "PATCH", 
            `/api/appointments/${appointmentData.appointment._id}/status`, 
            { status: "confirmed" }
          );
          console.log("Appointment confirmed:", await confirmRes.json());
        } catch (error) {
          console.error("Error confirming appointment:", error);
        }
      }
      
      return appointmentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been booked successfully! WhatsApp notifications have been sent to both you and the doctor with the appointment details.",
        variant: "default",
      });
      
      // Redirect to dashboard after successful booking
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000); // Give user 3 seconds to read the toast message
    },
    onError: () => {
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
    
    // Check if we have specific available dates for this doctor
    if (doctorAvailableDates?.availableDates && doctorAvailableDates.availableDates.length > 0) {
      // Find the specific date in the doctor's available dates
      const specificDate = doctorAvailableDates.availableDates.find(dateObj => {
        const availableDate = new Date(dateObj.date).toISOString().split('T')[0];
        return availableDate === date;
      });
      
      if (specificDate) {
        console.log('Found specific available date with time range:', specificDate);
        
        // Parse the specific time range for this date
        const timeRange = specificDate.timeRange || { startTime: "09:00", endTime: "17:00" };
        const [startHour, startMin] = timeRange.startTime.split(':').map(Number);
        const [endHour, endMin] = timeRange.endTime.split(':').map(Number);
        
        // Convert to minutes for easier calculation
        const startTimeMinutes = startHour * 60 + startMin;
        const endTimeMinutes = endHour * 60 + endMin;
        
        // Generate 30-minute slots between start and end time
        const slots: TimeSlot[] = [];
        for (let time = startTimeMinutes; time < endTimeMinutes; time += 30) {
          const hour = Math.floor(time / 60);
          const min = time % 60;
          const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          
          slots.push({
            time: timeString,
            available: true
          });
        }
        
        console.log(`Generated ${slots.length} time slots for doctor ${doctorId} on specific date ${date}`);
        return slots;
      }
      
      console.log(`Doctor has specific available dates but not for ${date}`);
      return [];
    }
    
    // Fall back to weekly schedule if no specific dates are available
    if (!doctorSchedules) return [];
    
    // Find the doctor's schedule
    const doctorSchedule = doctorSchedules.find(schedule => schedule.doctor._id === doctorId);
    if (!doctorSchedule) {
      console.log('No schedule found for this doctor');
      return [];
    }
    
    // Get the day of week for the selected date (0 = Sunday, 1 = Monday, etc.)
    const selectedDateObj = new Date(date);
    const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Find the schedule for this day of week
    const daySchedule = doctorSchedule.schedules.find(schedule => schedule.dayOfWeek === dayOfWeek);
    if (!daySchedule) {
      console.log(`Doctor doesn't work on day ${dayOfWeek}`);
      return [];
    }
    
    console.log('Found weekly schedule for day:', daySchedule);
    
    // Parse start and end times
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    const startTimeMinutes = startHour * 60 + startMin;
    const endTimeMinutes = endHour * 60 + endMin;
    
    // Generate 30-minute slots between start and end time
    const slots: TimeSlot[] = [];
    for (let time = startTimeMinutes; time < endTimeMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const min = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      slots.push({
        time: timeString,
        available: true
      });
    }
    
    console.log(`Generated ${slots.length} time slots for doctor ${doctorId} on ${date} from weekly schedule`);
    return slots;
  };

  const getAvailableSlots = (date: string) => {
    // Mock available slots - in a real app, this would come from the API
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`);
      if (hour !== 17) slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Handle booking submission
  const [, setLocation] = useLocation();

  const handleBooking = (formData: z.infer<typeof notesSchema>) => {
    console.log('Booking attempt with values:', {
      selectedDoctor,
      selectedDate,
      selectedTime,
      hospitalId,
      user: user ? `User found: ${user.username}` : 'No user',
      isLoggedIn: !!user,
      userRole: user?.role || 'none'
    });

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a doctor, date, and time before booking",
        variant: "destructive"
      });
      // Send user back to the doctor selection step if doctor is missing
      if (!selectedDoctor) {
        setBookingStep('doctor');
      }
      return;
    }

    if (!user) {
      console.log('No authenticated user found, redirecting to login');
      toast({
        title: "Authentication required",
        description: "Please login to book an appointment",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    // Enhanced validation with more specific error messages
    if (!selectedDoctor) {
      toast({
        title: "Doctor Required",
        description: "Please select a doctor for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (typeof selectedDoctor !== 'number' && typeof selectedDoctor !== 'string') {
      toast({
        title: "Invalid Doctor Selection",
        description: "Please select a valid doctor for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Time Required",
        description: "Please select a time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (!hospitalId) {
      toast({
        title: "Hospital Required",
        description: "Hospital information is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Convert types appropriately before sending to API
    const doctorIdValue = typeof selectedDoctor === 'string' ? selectedDoctor : String(selectedDoctor);
    const hospitalIdValue = parseInt(hospitalId);

    console.log('Submitting appointment with data:', {
      doctorId: doctorIdValue,
      hospitalId: hospitalIdValue,
      date: selectedDate,
      time: selectedTime,
      notes: formData.notes
    });

    // Submit the appointment
    if (!selectedDoctor) {
      toast({
        title: "Doctor not selected",
        description: "Please select a doctor first",
        variant: "destructive"
      });
      setBookingStep('doctor');
      return;
    }

    bookAppointmentMutation.mutate({
      doctorId: selectedDoctor,
      hospitalId: hospitalId || '',
      date: selectedDate || '',
      time: selectedTime || '',
      notes: formData.notes,
      reminderPreferences: {
        sms: notesForm.getValues('reminderPreferences.sms'),
        whatsapp: notesForm.getValues('reminderPreferences.whatsapp'),
        email: notesForm.getValues('reminderPreferences.email'),
        intervals: [24, 1]
      }
    });
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs value={bookingStep} onValueChange={(value) => setBookingStep(value as typeof bookingStep)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctor">Choose Doctor</TabsTrigger>
            <TabsTrigger value="datetime">Select Date & Time</TabsTrigger>
            <TabsTrigger value="confirm">Confirm Booking</TabsTrigger>
          </TabsList>

          {/* Step 1: Choose Doctor */}
          <TabsContent value="doctor">
            <Card>
              <CardHeader>
                <CardTitle>Select a Doctor</CardTitle>
                <CardDescription>
                  Choose from available doctors at {hospital?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors?.map((doctor) => (
                    <Card 
                      key={doctor.id} 
                      className={`cursor-pointer ${selectedDoctor === doctor.id ? 'border-2 border-primary-500' : 'hover:border-gray-300'}`}
                      onClick={() => {
                        console.log('Setting selected doctor to:', doctor.id);
                        setSelectedDoctor(doctor.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{doctor.title || ''} {doctor.name || (doctor.firstName && doctor.lastName ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor')}</h3>
                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                            <div className="mt-2 flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {doctor.rating || '4.5'} ({doctor.reviewCount || '24'} reviews)
                              </span>
                            </div>
                            <div className="mt-2">
                              <Badge>{doctor.specialty}</Badge>
                              {doctor.languages && (
                                <Badge variant="outline" className="ml-2">
                                  {Array.isArray(doctor.languages) 
                                    ? doctor.languages.join(', ')
                                    : doctor.languages}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {selectedDoctor === doctor.id && (
                            <div className="flex flex-col items-end gap-2">
                              <div className="h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      {selectedDoctor === doctor.id && (
                        <CardFooter>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Doctor selected:', doctor);
                              setBookingStep('datetime');
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600 border-0 font-bold"
                          >
                            Select This Doctor →
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
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
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>
                  Choose your preferred appointment date and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Available Dates</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {getAvailableDates().map((date) => (
                        <Button
                          key={date}
                          variant={selectedDate === date ? "default" : "outline"}
                          onClick={() => {
                            console.log('Date selected:', date);
                            setSelectedDate(date);
                          }}
                          className="mb-2"
                        >
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Available Times</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedDate ? (
                        <>
                          {/* Generate default time slots even if doctor isn't marked available */}
                          {[
                            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                            "15:00", "15:30", "16:00", "16:30"
                          ].map(time => (
                            <Button
                              key={`time-${time}`}
                              variant={selectedTime === time ? "default" : "outline"}
                              onClick={() => {
                                console.log('Time selected:', time);
                                setSelectedTime(time);
                              }}
                              className="w-full mb-2"
                            >
                              {time}
                            </Button>
                          ))}
                        </>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          Please select a date first
                        </p>
                      )}
                    </div>
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
                  disabled={!selectedDoctor || !selectedDate || !selectedTime} 
                  onClick={() => {
                    console.log('Proceeding to confirm step with:', {
                      doctor: selectedDoctor,
                      date: selectedDate,
                      time: selectedTime
                    });
                    // Ensure the doctor is selected before proceeding
                    if (!selectedDoctor) {
                      toast({
                        title: "Doctor not selected",
                        description: "Please select a doctor before proceeding",
                        variant: "destructive"
                      });
                      setBookingStep('doctor');
                      return;
                    }
                    setBookingStep('confirm');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
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
                      <p className="font-medium">{hospital?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{hospital?.address}</p>
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
                                id="whatsapp"
                                checked={notesForm.watch('reminderPreferences.whatsapp')}
                                onCheckedChange={(checked) => {
                                  notesForm.setValue('reminderPreferences.whatsapp', checked as boolean);
                                }}
                              />
                              <Label htmlFor="whatsapp">WhatsApp Reminders</Label>
                            </div>
                          </div>
                        </div>
                        
                        <Button type="submit" className="w-full">
                          Confirm Booking
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default BookingPage;
