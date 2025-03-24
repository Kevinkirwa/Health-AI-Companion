import { Route, Switch } from "wouter";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./hooks/use-auth";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
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

function Router() {
  // Adding console logs for debugging
  console.log("Router component rendering");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/chatbot" component={ChatbotPage} />
          <Route path="/hospitals" component={HospitalsPage} />
          <Route path="/mental-health" component={MentalHealthPage} />
          <Route path="/first-aid" component={FirstAidPage} />
          <ProtectedRoute path="/dashboard" component={DashboardPage} />
          <ProtectedRoute path="/admin" component={AdminPage} />
          <ProtectedRoute path="/booking/:hospitalId?" component={BookingPage} />
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
    </ThemeProvider>
  );
}

export default App;
