import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Layouts
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Pages
import HomePage from "@/pages/home-page";
import ChatbotPage from "@/pages/chatbot-page";
import HospitalsPage from "@/pages/hospitals-page";
import MentalHealthPage from "@/pages/mental-health-page";
import FirstAidPage from "@/pages/first-aid-page";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import BookingPage from "@/pages/booking-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/chatbot" component={ChatbotPage} />
          <Route path="/hospitals" component={HospitalsPage} />
          <Route path="/mental-health" component={MentalHealthPage} />
          <Route path="/first-aid" component={FirstAidPage} />
          <ProtectedRoute path="/dashboard" component={UserDashboard} />
          <ProtectedRoute path="/admin" component={AdminDashboard} />
          <ProtectedRoute path="/booking/:hospitalId?" component={BookingPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
