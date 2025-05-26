import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Hospital, Doctor, Appointment, User } from "@shared/schema";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, PencilIcon, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addHospitalOpen, setAddHospitalOpen] = useState(false);
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  // If not admin, redirect to home
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  // Get all hospitals
  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ["/hospitals/all"],
    queryFn: async () => {
      try {
        const res = await apiRequest<any>("/hospitals/all");
        console.log('Hospitals response:', res);
        
        // Debug the response structure
        if (res && typeof res === 'object') {
          console.log('Hospital response keys:', Object.keys(res));
        }
        
        if (Array.isArray(res)) {
          return res;
        } else if (res && res.hospitals && Array.isArray(res.hospitals)) {
          return res.hospitals;
        } else if (res && res.success && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        return [];
      }
    },
  });

  // Get all doctors
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["/doctors"],
    queryFn: async () => {
      console.log('Fetching doctors...');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      try {
        const res = await apiRequest<any>("/doctors", {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Doctors response:', res);
        
        // Debug the response structure
        if (res && typeof res === 'object') {
          console.log('Doctor response keys:', Object.keys(res));
        }
        
        if (Array.isArray(res)) {
          return res;
        } else if (res && res.doctors && Array.isArray(res.doctors)) {
          return res.doctors;
        } else if (res && res.success && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }
    },
  });

  // Get all appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/appointments/all"],
    queryFn: async () => {
      try {
        const res = await apiRequest<any>("/appointments/all");
        console.log('Appointments response:', res);
        
        // Debug the response structure
        if (res && typeof res === 'object') {
          console.log('Appointment response keys:', Object.keys(res));
        }
        
        if (Array.isArray(res)) {
          return res;
        } else if (res && res.appointments && Array.isArray(res.appointments)) {
          return res.appointments;
        } else if (res && res.success && res.data && Array.isArray(res.data)) {
          return res.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
  });

  // Get all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/users"],
    queryFn: async () => {
      try {
        const response = await apiRequest<any>("/users");
        console.log('Raw users response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          console.log('Response is an array, using directly');
          return response;
        } else if (response && response.users && Array.isArray(response.users)) {
          console.log('Using users array from response object');
          return response.users;
        } else if (response && typeof response === 'object') {
          console.log('Converting response object to array');
          // Last resort - convert to array if it's an object with user-like properties
          if (response.username || response.email) {
            return [response];
          }
        }
        
        console.log('Fallback to empty array');
        return [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
  });

  // Add hospital form schema
  const addHospitalSchema = z.object({
    name: z.string().min(1, "Hospital name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    website: z.string().optional(),
    openHours: z.string().optional(),
    specialties: z.string().transform(val => 
      val.split(",").map(s => s.trim()).filter(Boolean)
    ),
  });

  // Add doctor form schema
  const addDoctorSchema = z.object({
    name: z.string().min(1, "Doctor name is required"),
    hospitalId: z.string().min(1, "Hospital is required"),
    specialty: z.string().min(1, "Specialty is required"),
    bio: z.string().optional(),
  });

  // Add hospital form
  const addHospitalForm = useForm<z.infer<typeof addHospitalSchema>>({
    resolver: zodResolver(addHospitalSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      phone: "",
      email: "",
      website: "",
      openHours: "",
      specialties: "",
    },
  });

  // Add doctor form
  const addDoctorForm = useForm<z.infer<typeof addDoctorSchema>>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: {
      name: "",
      hospitalId: "",
      specialty: "",
      bio: "",
    },
  });

  // Add hospital mutation
  const addHospitalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addHospitalSchema>) => {
      const res = await apiRequest("POST", "/hospitals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/hospitals/all"] });
      setAddHospitalOpen(false);
      addHospitalForm.reset();
      toast({
        title: "Hospital Added",
        description: "The hospital has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add hospital. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addDoctorSchema>) => {
      const res = await apiRequest("POST", "/doctors", {
        ...data,
        hospitalId: parseInt(data.hospitalId),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/doctors"] });
      setAddDoctorOpen(false);
      addDoctorForm.reset();
      toast({
        title: "Doctor Added",
        description: "The doctor has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete hospital mutation
  const deleteHospitalMutation = useMutation({
    mutationFn: async (hospitalId: number) => {
      const res = await apiRequest("DELETE", `/hospitals/${hospitalId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/hospitals/all"] });
      toast({
        title: "Hospital Deleted",
        description: "The hospital has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete hospital. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const res = await apiRequest("DELETE", `/doctors/${doctorId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/doctors"] });
      toast({
        title: "Doctor Deleted",
        description: "The doctor has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add verify doctor mutation
  const verifyDoctorMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      console.log(`Verifying doctor with ID: ${doctorId}`);
      const res = await apiRequest<{ success: boolean; message: string; doctor: any }>(
        `/doctors/${doctorId}/verify`,
        {
          method: 'POST', // Changed from PUT to POST to avoid service worker issues
          body: JSON.stringify({ status: 'verified' })
        }
      );
      console.log('Verify response:', res);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Doctor verification status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/doctors"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update doctor verification status",
        variant: "destructive",
      });
    },
  });

  const unverifyDoctorMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      console.log(`Unverifying doctor with ID: ${doctorId}`);
      const res = await apiRequest<{ success: boolean; message: string; doctor: any }>(
        `/doctors/${doctorId}/verify`,
        {
          method: 'POST', // Changed from PUT to POST to avoid service worker issues
          body: JSON.stringify({ status: 'rejected' })
        }
      );
      console.log('Unverify response:', res);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Doctor verification status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/doctors"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update doctor verification status",
        variant: "destructive",
      });
    },
  });

  // Handle hospital form submission
  const onAddHospitalSubmit = (values: z.infer<typeof addHospitalSchema>) => {
    addHospitalMutation.mutate(values);
  };

  // Handle doctor form submission
  const onAddDoctorSubmit = (values: z.infer<typeof addDoctorSchema>) => {
    addDoctorMutation.mutate(values);
  };

  // Prepare data for analytics
  const appointmentsByStatus = [
    { name: "Confirmed", value: appointments?.filter(a => a.status === "confirmed").length || 0 },
    { name: "Pending", value: appointments?.filter(a => a.status === "pending").length || 0 },
    { name: "Cancelled", value: appointments?.filter(a => a.status === "cancelled").length || 0 },
  ];

  const appointmentsByHospital = hospitals?.map(hospital => ({
    name: hospital.name,
    appointments: appointments?.filter(a => a.hospitalId === hospital.id).length || 0,
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage hospitals, doctors, and view analytics
          </p>
        </div>

      <Tabs defaultValue="analytics">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Debug Tab */}
        <TabsContent value="debug">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>View raw data for troubleshooting</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto" style={{maxHeight: '500px'}}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Users Data:</h3>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(users, null, 2) || 'No user data'}
                  </pre>
                  <p className="text-sm text-gray-500 mt-1">Loading: {isLoadingUsers ? 'Yes' : 'No'}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Doctors Data:</h3>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(doctors, null, 2) || 'No doctor data'}
                  </pre>
                  <p className="text-sm text-gray-500 mt-1">Loading: {isLoadingDoctors ? 'Yes' : 'No'}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Hospitals Data:</h3>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(hospitals, null, 2) || 'No hospital data'}
                  </pre>
                  <p className="text-sm text-gray-500 mt-1">Loading: {isLoadingHospitals ? 'Yes' : 'No'}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Appointments Data:</h3>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-40">
                    {JSON.stringify(appointments, null, 2) || 'No appointment data'}
                  </pre>
                  <p className="text-sm text-gray-500 mt-1">Loading: {isLoadingAppointments ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{hospitals?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Doctors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{doctors?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{appointments?.length || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments by Status</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appointmentsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {appointmentsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments by Hospital</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentsByHospital}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="appointments" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manage Hospitals</CardTitle>
                    <CardDescription>Add, edit, or remove hospitals from the system</CardDescription>
                  </div>
                  <Dialog open={addHospitalOpen} onOpenChange={setAddHospitalOpen}>
                    <DialogTrigger asChild>
                      <Button>Add Hospital</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Hospital</DialogTitle>
                        <DialogDescription>
                          Enter the details of the new hospital below.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...addHospitalForm}>
                        <form onSubmit={addHospitalForm.handleSubmit(onAddHospitalSubmit)} className="space-y-4">
                          <FormField
                            control={addHospitalForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hospital Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="City General Hospital" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addHospitalForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234 Medical Drive, City Center" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={addHospitalForm.control}
                              name="latitude"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Latitude</FormLabel>
                                  <FormControl>
                                    <Input placeholder="40.7128" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addHospitalForm.control}
                              name="longitude"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Longitude</FormLabel>
                                  <FormControl>
                                    <Input placeholder="-74.0060" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={addHospitalForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addHospitalForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="info@cityhospital.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addHospitalForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://cityhospital.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addHospitalForm.control}
                            name="openHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Open Hours</FormLabel>
                                <FormControl>
                                  <Input placeholder="24/7 or 8AM-10PM" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addHospitalForm.control}
                            name="specialties"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specialties (comma separated)</FormLabel>
                                <FormControl>
                                  <Input placeholder="General Care, Emergency, Pediatric" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={addHospitalMutation.isPending}
                            >
                              {addHospitalMutation.isPending ? "Adding..." : "Add Hospital"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Specialties</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hospitals && hospitals.length > 0 ? (
                        hospitals.map((hospital) => (
                          <TableRow key={hospital.id}>
                            <TableCell className="font-medium">{hospital.name}</TableCell>
                            <TableCell>{hospital.address}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {hospital.specialties?.slice(0, 3).map((specialty, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {specialty}
                                  </Badge>
                                ))}
                                {hospital.specialties && hospital.specialties.length > 3 && (
                                  <Badge variant="outline">
                                    +{hospital.specialties.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{hospital.phone}</div>
                              <div className="text-sm text-gray-500">{hospital.email}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Feature",
                                      description: "Hospital editing will be available in a future update.",
                                    });
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  onClick={() => deleteHospitalMutation.mutate(hospital.id)}
                                  disabled={deleteHospitalMutation.isPending}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No hospitals found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manage Doctors</CardTitle>
                    <CardDescription>Add, edit, or remove doctors from the system</CardDescription>
                  </div>
                  <Dialog open={addDoctorOpen} onOpenChange={setAddDoctorOpen}>
                    <DialogTrigger asChild>
                      <Button>Add Doctor</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Doctor</DialogTitle>
                        <DialogDescription>
                          Enter the details of the new doctor below.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...addDoctorForm}>
                        <form onSubmit={addDoctorForm.handleSubmit(onAddDoctorSubmit)} className="space-y-4">
                          <FormField
                            control={addDoctorForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Doctor Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dr. John Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addDoctorForm.control}
                            name="hospitalId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hospital</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a hospital" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {hospitals?.map((hospital) => (
                                      <SelectItem key={hospital.id} value={hospital.id.toString()}>
                                        {hospital.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addDoctorForm.control}
                            name="specialty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specialty</FormLabel>
                                <FormControl>
                                  <Input placeholder="Cardiology" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addDoctorForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Write a brief bio for the doctor..." 
                                    className="min-h-24" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={addDoctorMutation.isPending}
                            >
                              {addDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors && doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell className="font-medium">{doctor.name}</TableCell>
                            <TableCell>
                              {doctor.hospital?.name || 
                               (hospitals?.find((h) => h.id === doctor.hospitalId)?.name) || 
                               `Hospital ID: ${doctor.hospitalId}`}
                            </TableCell>
                            <TableCell>{doctor.specialty}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {doctor.rating ? (
                                  <>
                                    <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                          key={star}
                                          className={`w-4 h-4 ${
                                            star <= Math.round(doctor.rating)
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-500">No ratings yet</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={doctor.isVerified ? "success" : "warning"}>
                                {doctor.isVerified ? "Verified" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    const doctorId = doctor._id || doctor.id;
                                    if (!doctorId) {
                                      toast({
                                        title: "Error",
                                        description: "Invalid doctor ID",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    if (doctor.isVerified) {
                                      unverifyDoctorMutation.mutate(doctorId.toString());
                                    } else {
                                      verifyDoctorMutation.mutate(doctorId.toString());
                                    }
                                  }}
                                  disabled={verifyDoctorMutation.isPending || unverifyDoctorMutation.isPending}
                                >
                                  {verifyDoctorMutation.isPending || unverifyDoctorMutation.isPending 
                                    ? "Updating..." 
                                    : doctor.isVerified 
                                      ? "Unverify" 
                                      : "Verify"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Feature",
                                      description: "Doctor editing will be available in a future update.",
                                    });
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  onClick={() => deleteDoctorMutation.mutate(doctor.id)}
                                  disabled={deleteDoctorMutation.isPending}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No doctors found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Manage Appointments</CardTitle>
                <CardDescription>View and manage all appointments in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <Input
                      placeholder="Search appointments..."
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments && appointments.length > 0 ? (
                        appointments.map((appointment) => {
                          const hospital = hospitals?.find(h => h.id === appointment.hospitalId);
                          const doctor = doctors?.find(d => d.id === appointment.doctorId);
                          const patient = users?.find(u => u.id === appointment.userId);
                          
                          return (
                            <TableRow key={appointment.id}>
                              <TableCell className="font-medium">
                                {patient?.name || patient?.username || `User #${appointment.userId}`}
                              </TableCell>
                              <TableCell>
                                {doctor?.name || `Doctor #${appointment.doctorId}`}
                              </TableCell>
                              <TableCell>
                                {hospital?.name || `Hospital #${appointment.hospitalId}`}
                              </TableCell>
                              <TableCell>
                                <div>{appointment.date}</div>
                                <div className="text-gray-500">{appointment.time}</div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    appointment.status === "confirmed" ? "success" :
                                    appointment.status === "pending" ? "warning" :
                                    "destructive"
                                  }
                                >
                                  {appointment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {appointment.status === "pending" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() => {
                                        toast({
                                          title: "Appointment Confirmed",
                                          description: "The appointment has been confirmed.",
                                        });
                                      }}
                                    >
                                      <Check className="h-4 w-4" /> Confirm
                                    </Button>
                                  )}
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "Appointment Cancelled",
                                        description: "The appointment has been cancelled.",
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No appointments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View and manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users && users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.role === 'admin' ? 'destructive' : 
                                         user.role === 'doctor' ? 'success' : 'secondary'}
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Feature",
                                      description: "User editing will be available in a future update.",
                                    });
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            {isLoadingUsers ? "Loading users..." : "No users found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default AdminPage;
