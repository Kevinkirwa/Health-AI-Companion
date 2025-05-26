import { Route, Switch } from "wouter";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./hooks/use-auth";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import ChatbotPage from "@/pages/chatbot-page";
import HospitalsPage from "@/pages/hospitals-page";
import MentalHealthPage from "@/pages/mental-health-page";
import FirstAidPage from "@/pages/first-aid-page";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import BookingPage from "@/pages/booking-page";
import { ProtectedRoute } from "@/lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { LanguageProvider } from "@/components/ui/language-selector";
import DoctorRegisterPage from '@/pages/doctor-register-page';
import AuthPage from '@/pages/auth-page';
import DoctorDashboardPage from '@/pages/doctor-dashboard-page';
import AboutPage from "@/pages/about-page";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  // Adding console logs for debugging
  console.log("Router component rendering");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/chatbot" component={ChatbotPage} />
          <Route path="/hospitals" component={HospitalsPage} />
          <Route path="/mental-health" component={MentalHealthPage} />
          <Route path="/first-aid" component={FirstAidPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <ProtectedRoute path="/admin/dashboard" component={AdminPage} requiredRole="admin" />
          <ProtectedRoute path="/booking/:hospitalId?" component={BookingPage} />
          <Route path="/doctor/register" component={DoctorRegisterPage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/doctor/dashboard" component={DoctorDashboardPage} requiredRole="doctor" />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  console.log("App component rendering");
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
