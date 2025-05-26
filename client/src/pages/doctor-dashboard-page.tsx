import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock3,
  Calendar as CalendarIcon,
  Users,
  FileText,
  Bell,
  Upload,
  Stethoscope,
  ClipboardList,
  FileSearch,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  Building2,
  GraduationCap,
  Award,
  Languages,
  DollarSign,
  Clock4
} from "lucide-react";
import { Appointment, User as Patient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Add new interfaces for enhanced features
interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  attachments: string[];
}

interface Schedule {
  id: string;
  hospitalId: string;
  date: string;
  timeSlots: {
    start: string;
    end: string;
    isAvailable: boolean;
  }[];
}

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState("");
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: "0",
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    appointmentDuration: 30,
    isAvailable: true
  });

  // If not a doctor, redirect to home
  if (!user || user.role !== "doctor") {
    return <Redirect to="/" />;
  }

  // Fetch doctor's verification status
  const { data: verificationStatus } = useQuery({
    queryKey: ["/doctor-dashboard/verification"],
    queryFn: async () => {
      const res = await apiRequest("/doctor-dashboard/verification");
      return res;
    }
  });

  // Fetch doctor's notifications
  const { data: notifications } = useQuery({
    queryKey: ["/doctor-dashboard/notifications"],
    queryFn: async () => {
      const res = await apiRequest("/doctor-dashboard/notifications");
      return res;
    }
  });

  // Fetch doctor's appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/doctor-dashboard/appointments"],
    queryFn: async () => {
      const res = await apiRequest("/doctor-dashboard/appointments");
      return res;
    }
  });

  // Fetch doctor's patients
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/doctor-dashboard/patients"],
    queryFn: async () => {
      const res = await apiRequest("/doctor-dashboard/patients");
      return res;
    }
  });

  // Fetch doctor's medical records
  const { data: medicalRecordsData } = useQuery<{ success: boolean; records: MedicalRecord[] }>({
    queryKey: ["/doctor-dashboard/medical-records"],
    queryFn: async () => {
      const res = await apiRequest("/doctor-dashboard/medical-records");
      return res;
    }
  });

  // Ensure medicalRecords is always an array
  const medicalRecords = medicalRecordsData?.records || [];
  
  // Function to handle appointment status updates
  const handleAppointmentStatus = (appointmentId: number | string, status: string) => {
    updateAppointmentStatusMutation.mutate({ appointmentId: Number(appointmentId), status });
  };

  // Fetch doctor's schedule
  const { data: schedule, refetch: refetchSchedule } = useQuery<Schedule[]>({
    queryKey: ["/doctor-dashboard/schedule"],
    queryFn: async () => {
      const res = await apiRequest("/doctor-dashboard/schedule");
      return res;
    }
  });
  
  // Schedule creation/update mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return await apiRequest("/doctor-dashboard/schedule", {
        method: "PUT",
        body: JSON.stringify(scheduleData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Schedule updated successfully",
        description: "Your availability has been updated.",
        variant: "success"
      });
      setIsScheduleFormOpen(false);
      refetchSchedule();
    },
    onError: (error) => {
      toast({
        title: "Failed to update schedule",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Fetch hospitals for dropdown
  const { data: hospitalsData } = useQuery({
    queryKey: ["/hospitals"],
    queryFn: async () => {
      const res = await apiRequest("/hospitals");
      return res;
    }
  });
  
  // Ensure hospitals is always an array
  const getHospitals = () => {
    if (!hospitalsData) return [];
    if (Array.isArray(hospitalsData)) return hospitalsData;
    if (hospitalsData.hospitals && Array.isArray(hospitalsData.hospitals)) return hospitalsData.hospitals;
    return [];
  };
  
  const hospitals = getHospitals();

  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: number; status: string }) => {
      const res = await apiRequest(`/appointments/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/doctor-dashboard/appointments"] }); // Also invalidate dashboard queries
      toast({
        title: "Appointment Updated",
        description: "The appointment status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add appointment notes mutation
  const addAppointmentNotesMutation = useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: number; notes: string }) => {
      const res = await apiRequest(`/appointments/${appointmentId}/notes`, {
        method: "PATCH",
        body: JSON.stringify({ notes })
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors/appointments"] });
      setIsNotesDialogOpen(false);
      toast({
        title: "Notes Added",
        description: "The appointment notes have been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    let icon;
    
    switch (status.toLowerCase()) {
      case "confirmed":
        color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case "pending":
        color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        icon = <Clock3 className="h-4 w-4 mr-1" />;
        break;
      case "cancelled":
        color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        icon = <AlertCircle className="h-4 w-4 mr-1" />;
        break;
      default:
        color = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        icon = <Clock className="h-4 w-4 mr-1" />;
    }
    
    return (
      <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon} {status}
      </span>
    );
  };

  // Filter appointments by date
  const filteredAppointments = appointments?.filter(appointment => 
    appointment.date === selectedDate
  );

  return (
    <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Enhanced Header with Quick Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, Dr. {user?.name || user?.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Today's Appointments</p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">
                    {appointments?.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 0}
                  </h3>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {appointments?.filter(a => a.status === 'confirmed').length || 0} confirmed
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Patients</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-700 dark:text-green-300">
                    {patients?.length || 0}
                  </h3>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                    {patients?.filter(p => p.lastVisit === new Date().toISOString().split('T')[0]).length || 0} today
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Medical Records</p>
                  <h3 className="text-2xl font-bold mt-1 text-purple-700 dark:text-purple-300">
                    {medicalRecords.length}
                  </h3>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    {medicalRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length} today
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Notifications</p>
                  <h3 className="text-2xl font-bold mt-1 text-orange-700 dark:text-orange-300">
                    {notifications?.filter(n => !n.read).length || 0}
                  </h3>
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                    {notifications?.filter(n => n.type === 'urgent').length || 0} urgent
                  </p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Sidebar with doctor profile */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your professional information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" alt={user?.name || user?.username} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0) || user?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Dr. {user?.name || user?.username}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              
              {/* Enhanced Professional Info */}
              <div className="w-full mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Professional Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="text-gray-500">Specialty:</span>
                      <span className="ml-2 font-medium">General Medicine</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="text-gray-500">License No:</span>
                      <span className="ml-2 font-medium">MD12345</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2 font-medium">5 years</span>
                    </div>
                    <div className="flex items-center">
                      <Languages className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="text-gray-500">Languages:</span>
                      <span className="ml-2 font-medium">English, Swahili</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-primary-500" />
                      <span className="text-gray-500">Consultation Fee:</span>
                      <span className="ml-2 font-medium">$50</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Verification Status */}
                {verificationStatus && (
                  <div className="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Verification Status</span>
                      <Badge variant={verificationStatus.status === 'verified' ? 'success' : 'warning'}>
                        {verificationStatus.status}
                      </Badge>
                    </div>
                    {verificationStatus.status !== 'verified' && (
                      <div className="mt-2">
                        <Progress value={verificationStatus.progress || 0} className="h-2" />
                        <p className="text-sm text-gray-500 mt-2">
                          {verificationStatus.message || 'Your verification is pending. Please upload required documents.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              
                {/* Enhanced Quick Actions */}
                <div className="w-full space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
                    <FileText className="h-4 w-4 mr-2" />
                    Medical Records
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Main content area with tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="schedule">
              <TabsList className="grid grid-cols-5 mb-8">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* Enhanced Schedule Tab */}
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Schedule Management</CardTitle>
                        <CardDescription>View and manage your appointments</CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={() => setIsScheduleFormOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Weekly Schedule
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex items-center gap-2"
                          asChild
                        >
                          <a href="/doctor/schedule-selection">
                            <Calendar className="h-4 w-4" /> Multiple Dates Selection
                          </a>
                        </Button>
                        <Select
                          value={selectedHospital || ""}
                          onValueChange={setSelectedHospital}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(hospitals) && hospitals.map((hospital) => (
                              <SelectItem key={hospital?.id || 'unknown'} value={hospital?.id || 'unknown'}>
                                {hospital?.name || 'Unknown Hospital'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAppointments ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading appointments...</p>
                      </div>
                    ) : appointments && appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <Card key={appointment.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-700">
                              <div className="p-4 md:w-2/3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                      {patients?.find(p => p.id === appointment.userId)?.name || 'Patient'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      Appointment #{appointment.id}
                                    </p>
                                  </div>
                                  <Badge variant={appointment.status === 'confirmed' ? 'success' : 'warning'}>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Clock className="h-4 w-4 mr-1" /> {appointment.time}
                                  </div>
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Building2 className="h-4 w-4 mr-1" /> {schedule?.find(h => h.id === appointment.hospitalId)?.hospitalId}
                                  </div>
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Phone className="h-4 w-4 mr-1" /> {patients?.find(p => p.id === appointment.userId)?.phone}
                                  </div>
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <Mail className="h-4 w-4 mr-1" /> {patients?.find(p => p.id === appointment.userId)?.email}
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 md:w-1/3 bg-gray-50 dark:bg-gray-800 flex flex-col justify-center items-center space-y-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setIsNotesDialogOpen(true);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Notes
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleAppointmentStatus(appointment.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleAppointmentStatus(appointment.id, 'cancelled')}
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No appointments found for this date.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Patients Tab */}
              <TabsContent value="patients">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Patient Management</CardTitle>
                        <CardDescription>View and manage your patient list</CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search patients..."
                            className="pl-9 w-[200px]"
                          />
                        </div>
                        <Select>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Patients</SelectItem>
                            <SelectItem value="recent">Recent</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPatients ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading patients...</p>
                      </div>
                    ) : patients && patients.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Last Visit</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patients.map((patient) => (
                              <TableRow key={patient.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage src="" alt={patient.name} />
                                      <AvatarFallback>
                                        {patient.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{patient.name}</p>
                                      <p className="text-sm text-gray-500">ID: {patient.id}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="text-sm">{patient.email}</p>
                                    <p className="text-sm text-gray-500">{patient.phone}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="text-sm">
                                      {appointments?.find(a => a.userId === patient.id)?.date || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {appointments?.find(a => a.userId === patient.id)?.time || ''}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No patients found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Medical Records Tab */}
              <TabsContent value="records">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Medical Records</CardTitle>
                        <CardDescription>Manage patient medical records and history</CardDescription>
                      </div>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Record
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medicalRecords?.map((record) => (
                        <Card key={record.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">
                                  {patients?.find(p => p.id === record.patientId)?.name}
                                </h3>
                                <p className="text-sm text-gray-500">{record.date}</p>
                              </div>
                              <Badge variant="outline">{record.diagnosis}</Badge>
                            </div>
                            <div className="mt-4 space-y-2">
                              <p className="text-sm"><strong>Diagnosis:</strong> {record.diagnosis}</p>
                              <p className="text-sm"><strong>Prescription:</strong> {record.prescription}</p>
                              <p className="text-sm"><strong>Notes:</strong> {record.notes}</p>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Document Management</CardTitle>
                        <CardDescription>Upload and manage your verification documents</CardDescription>
                      </div>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {verificationStatus?.requiredDocuments?.map((doc) => (
                        <Card key={doc.type} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{doc.name}</h3>
                                <p className="text-sm text-gray-500">{doc.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {doc.status === 'uploaded' ? (
                                  <Badge variant="success">Uploaded</Badge>
                                ) : doc.status === 'pending' ? (
                                  <Badge variant="warning">Pending Review</Badge>
                                ) : (
                                  <Button size="sm" onClick={() => {
                                    // Handle document upload
                                  }}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </Button>
                                )}
                              </div>
                            </div>
                            {doc.status === 'uploaded' && (
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Stay updated with important alerts and messages</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark All Read
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        {notifications?.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`flex items-start p-4 rounded-lg ${
                              notification.type === 'appointment' 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : notification.type === 'verification'
                                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                                : notification.type === 'urgent'
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : 'bg-gray-50 dark:bg-gray-800'
                            }`}
                          >
                            <div className="mr-4">
                              {notification.type === 'appointment' ? (
                                <Calendar className="h-5 w-5 text-blue-500" />
                              ) : notification.type === 'verification' ? (
                                <CheckCircle className="h-5 w-5 text-yellow-500" />
                              ) : notification.type === 'urgent' ? (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                <Bell className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm mt-1">{notification.message}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.timestamp).toLocaleString()}
                                  </span>
                                  {!notification.read && (
                                    <Badge variant="outline">New</Badge>
                                  )}
                                </div>
                              </div>
                              {notification.actions && (
                                <div className="mt-3 flex space-x-2">
                                  {notification.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => action.onClick()}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Enhanced Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Notes</DialogTitle>
            <DialogDescription>
              View and update notes for this appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter appointment notes..."
                className="min-h-[200px]"
              />
            </div>
            {selectedAppointment && (
              <div className="space-y-2">
                <Label>Patient Information</Label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-gray-500">
                      {patients?.find(p => p.id === selectedAppointment.userId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-gray-500">
                      {patients?.find(p => p.id === selectedAppointment.userId)?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-500">
                      {patients?.find(p => p.id === selectedAppointment.userId)?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Appointment Time</p>
                    <p className="text-sm text-gray-500">{selectedAppointment.time}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNotesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAppointment) {
                  addAppointmentNotesMutation.mutate({
                    appointmentId: selectedAppointment.id,
                    notes
                  });
                }
              }}
              disabled={addAppointmentNotesMutation.isPending}
            >
              {addAppointmentNotesMutation.isPending ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Form Dialog */}
      <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
            <DialogDescription>
              Set your availability for patient appointments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hospital">Hospital</Label>
              <Select 
                value={selectedHospital} 
                onValueChange={(value) => setSelectedHospital(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Hospital" />
                </SelectTrigger>
                <SelectContent>
                  {getHospitals().map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select 
                value={scheduleForm.dayOfWeek} 
                onValueChange={(value) => setScheduleForm({...scheduleForm, dayOfWeek: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="breakStart">Break Start</Label>
                <Input 
                  id="breakStart" 
                  type="time" 
                  value={scheduleForm.breakStart}
                  onChange={(e) => setScheduleForm({...scheduleForm, breakStart: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breakEnd">Break End</Label>
                <Input 
                  id="breakEnd" 
                  type="time" 
                  value={scheduleForm.breakEnd}
                  onChange={(e) => setScheduleForm({...scheduleForm, breakEnd: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="appointmentDuration">Appointment Duration (minutes)</Label>
              <Input 
                id="appointmentDuration" 
                type="number" 
                min="5"
                max="120"
                step="5"
                value={scheduleForm.appointmentDuration}
                onChange={(e) => setScheduleForm({...scheduleForm, appointmentDuration: parseInt(e.target.value)})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAvailable" 
                checked={scheduleForm.isAvailable}
                onCheckedChange={(checked) => 
                  setScheduleForm({...scheduleForm, isAvailable: checked === true})
                }
              />
              <label
                htmlFor="isAvailable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Available for appointments
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleFormOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (!selectedHospital) {
                  toast({
                    title: "Hospital required",
                    description: "Please select a hospital",
                    variant: "destructive"
                  });
                  return;
                }
                
                updateScheduleMutation.mutate({
                  ...scheduleForm,
                  hospitalId: selectedHospital,
                  dayOfWeek: parseInt(scheduleForm.dayOfWeek),
                  doctorId: user.id
                });
              }}
              disabled={updateScheduleMutation.isPending}
            >
              {updateScheduleMutation.isPending ? 'Saving...' : 'Save Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DoctorDashboardPage;