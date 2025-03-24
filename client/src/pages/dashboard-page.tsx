import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Settings, 
  MessageSquare, 
  Bookmark, 
  CheckCircle, 
  AlertCircle, 
  Clock3 
} from "lucide-react";
import { Appointment, ChatMessage, Hospital } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DashboardPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  // Get user appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    }
  });

  // Get user saved hospitals
  const { data: savedHospitals, isLoading: isLoadingSavedHospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals/saved"],
    queryFn: async () => {
      const res = await fetch("/api/hospitals/saved");
      if (!res.ok) throw new Error("Failed to fetch saved hospitals");
      return res.json();
    }
  });

  // Get chat history
  const { data: chatHistory, isLoading: isLoadingChatHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
    queryFn: async () => {
      const res = await fetch("/api/chat/history");
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return res.json();
    }
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const res = await apiRequest("POST", `/api/appointments/${appointmentId}/cancel`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove saved hospital mutation
  const removeSavedHospitalMutation = useMutation({
    mutationFn: async (hospitalId: number) => {
      const res = await apiRequest("DELETE", `/api/hospitals/saved/${hospitalId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals/saved"] });
      toast({
        title: "Hospital Removed",
        description: "The hospital has been removed from your saved list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove hospital. Please try again.",
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

  return (
    <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Your Health Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your appointments, saved hospitals, and view your health history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with user profile */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" alt={user?.name || user?.username} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0) || user?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.name || user?.username}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Account Settings</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  </div>
                  <Switch 
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content area with tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="appointments">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="saved">Saved Hospitals</TabsTrigger>
                <TabsTrigger value="history">Chat History</TabsTrigger>
              </TabsList>

              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Your Appointments</CardTitle>
                        <CardDescription>Manage your upcoming and past appointments</CardDescription>
                      </div>
                      <Button asChild>
                        <Link href="/hospitals">Book New Appointment</Link>
                      </Button>
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
                                    <h3 className="font-medium text-gray-900 dark:text-white">Dr. Smith</h3>
                                    <p className="text-gray-600 dark:text-gray-400">City General Hospital</p>
                                  </div>
                                  <StatusBadge status={appointment.status} />
                                </div>
                                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-4 w-4 mr-1" /> {appointment.date}
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="h-4 w-4 mr-1" /> {appointment.time}
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-4 w-4 mr-1" /> 1234 Medical Drive, City Center
                                </div>
                                {appointment.notes && (
                                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Notes:</span> {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 flex flex-row md:flex-col md:w-1/3 justify-between items-center">
                                <Button 
                                  variant="outline" 
                                  className="w-full mb-2"
                                  asChild
                                >
                                  <Link href={`/booking/${appointment.hospitalId}`}>
                                    Reschedule
                                  </Link>
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  className="w-full"
                                  onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                  disabled={cancelAppointmentMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any appointments yet.</p>
                        <Button asChild>
                          <Link href="/hospitals">Book Your First Appointment</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Hospitals Tab */}
              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Hospitals</CardTitle>
                    <CardDescription>Hospitals and clinics you've saved for quick access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSavedHospitals ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading saved hospitals...</p>
                      </div>
                    ) : savedHospitals && savedHospitals.length > 0 ? (
                      <div className="space-y-4">
                        {savedHospitals.map((hospital) => (
                          <Card key={hospital.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-700">
                              <div className="p-4 md:w-2/3">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {hospital.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {hospital.address}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {hospital.specialties?.map((specialty, idx) => (
                                    <span 
                                      key={idx} 
                                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 flex flex-row md:flex-col md:w-1/3 justify-between items-center">
                                <Button 
                                  className="w-full mb-2"
                                  asChild
                                >
                                  <Link href={`/booking/${hospital.id}`}>
                                    Book Appointment
                                  </Link>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => removeSavedHospitalMutation.mutate(hospital.id)}
                                  disabled={removeSavedHospitalMutation.isPending}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't saved any hospitals yet.</p>
                        <Button asChild>
                          <Link href="/hospitals">Find Hospitals</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Chat History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Chat History</CardTitle>
                        <CardDescription>Your conversations with the AI Health Assistant</CardDescription>
                      </div>
                      <Button asChild>
                        <Link href="/chatbot">New Conversation</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingChatHistory ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading chat history...</p>
                      </div>
                    ) : chatHistory && chatHistory.length > 0 ? (
                      <div className="space-y-4">
                        {/* Group messages by conversation and date */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2 text-primary-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  Health Consultation
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date().toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="p-4 max-h-96 overflow-y-auto">
                            {chatHistory.map((message, idx) => (
                              <div key={idx} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role !== 'user' && (
                                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-2 flex-shrink-0">
                                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                                    </svg>
                                  </div>
                                )}
                                <div className={`p-3 rounded-lg max-w-[75%] ${
                                  message.role === 'user' 
                                    ? 'bg-primary-500 text-white' 
                                    : 'bg-white dark:bg-gray-800 shadow-sm'
                                }`}>
                                  <p className={message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
                                    {message.content}
                                  </p>
                                  <div className="text-xs mt-1 text-right text-gray-400 dark:text-gray-500">
                                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't had any conversations yet.</p>
                        <Button asChild>
                          <Link href="/chatbot">Start a Conversation</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
