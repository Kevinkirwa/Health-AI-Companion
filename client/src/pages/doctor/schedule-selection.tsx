import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeRange = {
  startTime: string;
  endTime: string;
};

type SpecificDate = {
  date: Date;
  isAvailable: boolean;
  timeRange: TimeRange;
};

const DoctorScheduleSelection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hospitalId: urlHospitalId } = useParams<{ hospitalId: string }>();
  const [location, setLocation] = useLocation();
  
  // State for hospital selection
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(urlHospitalId);
  const [hospitals, setHospitals] = useState<Array<{id: string, name: string}>>([]);
  const [isHospitalSelected, setIsHospitalSelected] = useState<boolean>(!!urlHospitalId);
  
  // Default time settings for quick selection
  const DEFAULT_START_TIME = "08:00";
  const DEFAULT_END_TIME = "15:00";
  
  const [weeklySchedule, setWeeklySchedule] = useState<Record<number, TimeRange>>({
    0: { startTime: "10:00", endTime: "14:00" }, // Sunday
    1: { startTime: "09:00", endTime: "17:00" }, // Monday
    2: { startTime: "09:00", endTime: "17:00" }, // Tuesday
    3: { startTime: "09:00", endTime: "17:00" }, // Wednesday
    4: { startTime: "09:00", endTime: "17:00" }, // Thursday
    5: { startTime: "09:00", endTime: "17:00" }, // Friday
    6: { startTime: "10:00", endTime: "14:00" }, // Saturday
  });
  
  const [specificDates, setSpecificDates] = useState<SpecificDate[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("weekly");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeRange, setTimeRange] = useState<TimeRange>({ startTime: "09:00", endTime: "17:00" });
  
  // Fetch hospitals using the public /api/hospitals endpoint instead of doctor-specific one
  const { data: doctorHospitals, isLoading: isLoadingHospitals, error: hospitalError } = useQuery({
    queryKey: ["public-hospitals"],
    queryFn: async () => {
      try {
        console.log("Fetching hospitals from public endpoint...");
        const response = await apiRequest("/api/hospitals", {
          method: "GET"
        });
        
        console.log("Public Hospitals API Response:", response);
        
        if (!response.hospitals || !Array.isArray(response.hospitals)) {
          console.error("Invalid hospital data format from public endpoint:", response);
          return [{ id: 'public-fallback', name: 'Default Hospital' }];
        }
        
        // Transform hospital data to match expected format (id and name)
        const formattedHospitals = response.hospitals.map(hospital => ({
          id: hospital._id?.toString() || hospital.id || 'unknown-id',
          name: hospital.name || 'Unnamed Hospital'
        }));
        
        console.log(`Found ${formattedHospitals.length} hospitals in public response`, formattedHospitals);
        return formattedHospitals;
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        // Return a fallback hospital in case of fetch error
        return [{ id: 'public-fallback', name: 'Default Hospital' }];
      }
    },
    onSuccess: (data) => {
      console.log("Hospital data received from public endpoint:", data);
      // Ensure we're setting a valid array
      if (Array.isArray(data)) {
        setHospitals(data);
        console.log("Updated hospitals state with", data.length, "hospitals");
        
        // If we only have one hospital and no hospital is selected yet, auto-select it
        if (data.length === 1 && !selectedHospitalId) {
          console.log("Auto-selecting the only available hospital:", data[0]);
          setSelectedHospitalId(data[0].id);
          setIsHospitalSelected(true);
          toast({
            title: "Hospital Selected",
            description: `Auto-selected ${data[0].name} as your hospital.`,
          });
        }
      } else {
        console.error("Received non-array hospital data:", data);
        setHospitals([{ id: 'data-error', name: 'Data Error Hospital' }]);
      }
    },
    onError: (error) => {
      console.error("Hospital fetch error:", error);
      // Set a fallback hospital in the state
      setHospitals([{ id: 'error-fallback', name: 'Fallback Hospital' }]);
      toast({
        variant: "destructive",
        title: "Error loading hospitals",
        description: "Using default hospital information. You can still set your schedule.",
      });
    }
  });

  // Fetch doctor's current schedule
  const { data: schedule, isLoading } = useQuery({
    queryKey: ["doctor-schedule", selectedHospitalId],
    enabled: !!selectedHospitalId,
    queryFn: async () => {
      const response = await apiRequest(`/api/doctor-dashboard/schedule?hospitalId=${selectedHospitalId}`, {
        method: "GET"
      });
      return response.schedule;
    }
  });
  
  // Update schedule when data is loaded
  useEffect(() => {
    if (schedule) {
      // Update weekly schedule
      if (schedule.weeklySchedule) {
        setWeeklySchedule(schedule.weeklySchedule);
      }
      
      // Update specific dates
      if (schedule.specificDates && schedule.specificDates.length > 0) {
        // Make sure to parse dates properly
        const parsedDates = schedule.specificDates.map((date: any) => ({
          date: new Date(date.date),
          isAvailable: date.isAvailable,
          timeRange: date.timeRange || { startTime: "09:00", endTime: "17:00" }
        }));
        setSpecificDates(parsedDates);
        
        // Log to help debug
        console.log('Loaded scheduled dates:', parsedDates.map(d => d.date.toLocaleDateString()));
      }
    }
  }, [schedule]);
  
  // Save schedule mutation
  const saveScheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Saving schedule with data:', data);
      return await apiRequest("/api/doctor-dashboard/schedule", {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedule"] });
      toast({
        title: "Schedule Updated",
        description: "Your availability schedule has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Failed to update schedule:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your schedule. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSaveSchedule = () => {
    if (!selectedHospitalId) {
      toast({
        title: "No Hospital Selected",
        description: "Please select a hospital first before saving your schedule.",
        variant: "destructive",
      });
      return;
    }

    // Format the schedule data for API
    const scheduleData = {
      doctorId: user?.id,
      hospitalId: selectedHospitalId,
      weeklySchedule,
      specificDates: specificDates.map(date => ({
        date: date.date.toISOString(),
        isAvailable: date.isAvailable,
        timeRange: date.timeRange
      }))
    };
    
    saveScheduleMutation.mutate(scheduleData);
  };
  
  const handleDayScheduleChange = (day: number, field: keyof TimeRange, value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
  
  const handleAddSpecificDate = () => {
    if (!selectedDate) {
      toast({
        title: "No Date Selected",
        description: "Please select a date from the calendar first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!timeRange.startTime || !timeRange.endTime) {
      toast({
        title: "Time Range Required",
        description: "Please specify both start and end times for your availability.",
        variant: "destructive",
      });
      return;
    }

    // Validate time range
    const startMinutes = timeToMinutes(timeRange.startTime);
    const endMinutes = timeToMinutes(timeRange.endTime);
    
    if (startMinutes >= endMinutes) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if date already exists
    const existingDateIndex = specificDates.findIndex(
      d => d.date.toDateString() === selectedDate.toDateString()
    );
    
    if (existingDateIndex >= 0) {
      // Update existing date
      const updatedDates = [...specificDates];
      updatedDates[existingDateIndex] = {
        ...updatedDates[existingDateIndex],
        isAvailable: true,
        timeRange: { ...timeRange }
      };
      setSpecificDates(updatedDates);
    } else {
      // Add new date
      setSpecificDates(prev => [
        ...prev,
        {
          date: selectedDate,
          isAvailable: true,
          timeRange: { ...timeRange }
        }
      ]);
    }
    
    // Keep the date selected to make adding multiple days easier
    toast({
      title: "Date Added",
      description: `${selectedDate.toLocaleDateString()} with hours ${timeRange.startTime} - ${timeRange.endTime} has been added to your available dates.`,
      variant: "default",
    });
  };
  
  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const handleRemoveSpecificDate = (dateToRemove: Date) => {
    setSpecificDates(prev => prev.filter(d => 
      d.date.toDateString() !== dateToRemove.toDateString()
    ));
  };
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const handleHospitalChange = (hospitalId: string) => {
    if (!hospitalId) {
      toast({
        variant: "destructive",
        title: "Hospital Required",
        description: "You must select a hospital to manage your schedule."
      });
      return;
    }
    
    console.log(`Selected hospital: ${hospitalId}`);
    setSelectedHospitalId(hospitalId);
    setIsHospitalSelected(true);

    // Find selected hospital name for the toast message
    const selectedHospital = hospitals.find(h => h.id === hospitalId);
    if (selectedHospital) {
      toast({
        title: "Hospital Selected",
        description: `You're now managing your schedule at ${selectedHospital.name}.`,
      });
    }
    
    // Clear specific dates when changing hospitals
    setSpecificDates([]);
  };

  return (
    <div className="container max-w-5xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Schedule Management</CardTitle>
          <CardDescription>
            Set your availability for appointments by selecting specific dates and time ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Hospital Selection */}
          <div className="mb-6">
            <Label htmlFor="hospital-select" className="mb-2 block font-medium">Select Hospital</Label>
            
            {/* Debug Output - Will show actual hospital data */}
            <div className="p-2 mb-2 bg-gray-100 rounded text-xs overflow-auto max-h-20">
              <p>Loading: {isLoadingHospitals ? 'Yes' : 'No'}</p>
              <p>Hospitals count: {hospitals.length}</p>
              <p>First hospital: {hospitals.length > 0 ? `${hospitals[0].id} - ${hospitals[0].name}` : 'None'}</p>
            </div>
            
            <div className="flex gap-4 items-center">
              {isLoadingHospitals ? (
                <div className="text-sm text-muted-foreground">Loading hospitals...</div>
              ) : hospitals.length > 0 ? (
                <div className="w-full max-w-md">
                  <select 
                    className="w-full p-2 border rounded-md" 
                    value={selectedHospitalId || ''}
                    onChange={(e) => handleHospitalChange(e.target.value)}
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No hospitals available</div>
              )}
            </div>

            {!selectedHospitalId && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hospital Selection Required</AlertTitle>
                <AlertDescription>
                  You must select a hospital before setting your schedule. Your availability is hospital-specific.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {!selectedHospitalId ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Please select a hospital to manage your schedule</p>
            </div>
          ) : (
            <>
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Multiple Date Selection</AlertTitle>
            <AlertDescription>
              You can select multiple specific dates and set custom time ranges for each. 
              Patients will only be able to book appointments on these dates within your specified hours.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="specific" onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="specific">Specific Dates</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Set Your Weekly Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your regular weekly availability
                </p>
                
                <div className="grid gap-6">
                  {Object.entries(weeklySchedule).map(([day, schedule]) => (
                    <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border p-4 rounded-md">
                      <div>
                        <h4 className="font-medium">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(day)]}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`start-${day}`}>Start Time</Label>
                          <Input
                            id={`start-${day}`}
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => handleDayScheduleChange(Number(day), 'startTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`end-${day}`}>End Time</Label>
                          <Input
                            id={`end-${day}`}
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => handleDayScheduleChange(Number(day), 'endTime', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`available-${day}`}
                          // Implementation for checking availability would go here
                        />
                        <Label htmlFor={`available-${day}`}>Available</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specific">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Select Specific Dates</h3>
                    <Badge variant="outline" className="text-sm">
                      {specificDates.length} date(s) selected
                    </Badge>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="mb-4 p-3 bg-muted rounded-lg flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-sm">Select a date from the calendar, set your hours, and click "Add Date"</span>
                    </div>
                    
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        console.log('Date selected:', date);
                        setSelectedDate(date);
                      }}
                      className="rounded-md border"
                      disabled={(date) => {
                        // Disable dates before today
                        return date < new Date(new Date().setHours(0,0,0,0));
                      }}
                      modifiersClassNames={{
                        selected: "bg-primary text-primary-foreground",
                        booked: "bg-green-100 text-green-900 hover:bg-green-200"
                      }}
                      components={{
                        // Custom day rendering to show indicators for booked dates
                        day: ({ date, ...props }) => {
                          // Check if this date is already in our specific dates
                          const isBooked = specificDates.some(
                            (d) => d.date.toDateString() === date.toDateString()
                          );
                          
                          return (
                            <div 
                              {...props}
                              className={`${props.className} relative ${
                                isBooked ? 'border-green-500 border-2' : ''
                              }`}
                            >
                              {date.getDate()}
                              {isBooked && (
                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-1 bg-green-500 rounded-full" />
                              )}
                            </div>
                          );
                        }
                      }}
                    />
                    
                    <div className="mt-6 p-4 border rounded-md bg-background">
                      <div className="flex items-center mb-3">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        <h4 className="font-medium">
                          {selectedDate ? `Set hours for ${selectedDate.toLocaleDateString()}` : 'Select a date first'}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label htmlFor="specific-start">Start Time</Label>
                          <Input
                            id="specific-start"
                            type="time"
                            value={timeRange.startTime}
                            onChange={(e) => setTimeRange(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label htmlFor="specific-end">End Time</Label>
                          <Input
                            id="specific-end"
                            type="time"
                            value={timeRange.endTime}
                            onChange={(e) => setTimeRange(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAddSpecificDate}
                          className="w-full"
                          disabled={!selectedDate}
                        >
                          Add Selected Date
                        </Button>
                        
                        {/* Quick preset buttons */}
                        <Button 
                          variant="outline" 
                          onClick={() => setTimeRange({ startTime: "08:00", endTime: "15:00" })}
                          className="whitespace-nowrap"
                          title="Set time from 8:00 AM to 3:00 PM"
                        >
                          8AM-3PM
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Your Available Dates</h3>
                  <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
                    {specificDates.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <p className="text-muted-foreground">
                          No specific dates added yet. Select dates from the calendar to add them.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Patients can only book appointments on the dates you select here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {specificDates
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((date, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30">
                              <div>
                                <div className="font-medium">
                                  {date.date.toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {date.timeRange.startTime} - {date.timeRange.endTime}
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                onClick={() => handleRemoveSpecificDate(date.date)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            You can select any number of days and set custom hours for each day.
          </p>
          <Button onClick={handleSaveSchedule} disabled={saveScheduleMutation.isPending || !selectedHospitalId}>
            {saveScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DoctorScheduleSelection;
