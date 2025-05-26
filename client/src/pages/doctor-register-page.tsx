import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DoctorRegisterPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [availability, setAvailability] = useState<Availability[]>([
    {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true
    }
  ]);

  const addAvailability = () => {
    setAvailability([
      ...availability,
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true
      }
    ]);
  };

  const removeAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateAvailability = (index: number, field: keyof Availability, value: any) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    setAvailability(newAvailability);
  };

  // Get hospitals for registration
  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ["/api/hospitals"],
    queryFn: async () => {
      try {
        const res = await apiRequest<any[]>("/hospitals", {
          method: "GET"
        });
        console.log('Hospitals response:', res);
        
        // Handle different response formats
        if (Array.isArray(res)) {
          return res;
        } else if (res && res.hospitals && Array.isArray(res.hospitals)) {
          return res.hospitals;
        } else if (res && res.success && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        
        console.error('Unexpected hospitals response format:', res);
        return [];
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        toast({
          title: "Error",
          description: "Failed to fetch hospitals. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Doctor registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name: string;
      hospitalId: string;
      specialization: string;
      phone: string;
      licenseNumber: string;
      consultationFee: number;
      availability: string;
      schedule: {
        monday: { start: string; end: string };
        tuesday: { start: string; end: string };
        wednesday: { start: string; end: string };
        thursday: { start: string; end: string };
        friday: { start: string; end: string };
        saturday: { start: string; end: string };
        sunday: { start: string; end: string };
      };
    }) => {
      console.log('Mutation function called with data:', {
        ...data,
        password: data.password ? '[REDACTED]' : undefined
      });

      const res = await apiRequest("/doctors/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res;
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please wait for verification.",
      });
      setLocation("/auth");
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedHospital) {
      toast({
        title: "Validation Error",
        description: "Please select a hospital",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Debug log for form data
    console.log('Form Data Values:', {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password") ? '[REDACTED]' : undefined,
      specialty: formData.get("specialty"),
      licenseNumber: formData.get("licenseNumber"),
      hospitalId: selectedHospital,
      consultationFee: formData.get("consultationFee")
    });

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      hospitalId: selectedHospital,
      specialization: formData.get("specialty") as string,
      phone: formData.get("phone") as string,
      licenseNumber: formData.get("licenseNumber") as string,
      consultationFee: parseInt(formData.get("consultationFee") as string) || 0,
      availability: "Available",
      schedule: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: { start: "09:00", end: "13:00" },
        sunday: { start: "09:00", end: "13:00" }
      }
    };

    // Debug log for final request data
    console.log('Sending registration data:', {
      ...data,
      password: '[REDACTED]'
    });

    try {
      await registerMutation.mutateAsync(data);
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
    }
  };

  if (isLoadingHospitals) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Doctor Registration</CardTitle>
          <CardDescription>
            Register as a doctor to join our healthcare network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Dr. John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="doctor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+254 700 000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  required
                  placeholder="e.g., General Medicine"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select
                  value={selectedHospital}
                  onValueChange={setSelectedHospital}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals?.map((hospital) => (
                      <SelectItem key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  required
                  placeholder="e.g., MED123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  required
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  name="education"
                  required
                  placeholder="e.g., MBChB, University of Nairobi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  name="languages"
                  required
                  placeholder="e.g., English, Swahili"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (KES)</Label>
                <Input
                  id="consultationFee"
                  name="consultationFee"
                  type="number"
                  required
                  min={0}
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Availability Schedule</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAvailability}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>
                
                {availability.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Select
                          value={schedule.dayOfWeek.toString()}
                          onValueChange={(value) => updateAvailability(index, 'dayOfWeek', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`available-${index}`}
                          checked={schedule.isAvailable}
                          onCheckedChange={(checked) => 
                            updateAvailability(index, 'isAvailable', checked)
                          }
                        />
                        <Label htmlFor={`available-${index}`}>Available</Label>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAvailability(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <CardFooter className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register as Doctor"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRegisterPage; 