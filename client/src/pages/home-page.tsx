import { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import FeaturesGrid from "@/components/ui/features-grid";
import Testimonials from "@/components/ui/testimonials";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Calendar, Brain, Heart, MessageSquareText, CalendarPlus, Users, Clock, Shield } from "lucide-react";

const HomePage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "AI Health Chatbot",
      description: "Get instant responses to your health concerns with our AI-powered chatbot.",
      bgColorClass: "bg-primary-100 dark:bg-primary-900",
      iconColorClass: "text-primary-600 dark:text-primary-400"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Nearest Hospitals",
      description: "Find hospitals near you with real-time availability and directions.",
      bgColorClass: "bg-primary-100 dark:bg-primary-900",
      iconColorClass: "text-primary-600 dark:text-primary-400"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Mental Health Support",
      description: "Access resources, exercises, and AI guidance for mental wellness.",
      bgColorClass: "bg-blue-100 dark:bg-blue-900",
      iconColorClass: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "First-Aid Tips",
      description: "Quick access to emergency procedures and first-aid instructions.",
      bgColorClass: "bg-red-100 dark:bg-red-900",
      iconColorClass: "text-red-600 dark:text-red-400"
    }
  ];

  const testimonials = [
    {
      text: "The AI chatbot accurately identified my symptoms and recommended I see a specialist. It potentially saved me from a serious health issue!",
      author: "Sarah Johnson",
      rating: 5,
      role: "Patient"
    },
    {
      text: "Finding a nearby hospital at 2 AM during an emergency was a lifesaver. The directions were accurate and I got there quickly.",
      author: "Michael Davis",
      rating: 4.5,
      role: "Emergency Care User"
    },
    {
      text: "The mental health exercises helped me manage my anxiety during the pandemic. I use the breathing techniques daily now.",
      author: "Emily Rodriguez",
      rating: 5,
      role: "Mental Health Advocate"
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "50K+", label: "Active Users" },
    { icon: <Clock className="w-6 h-6" />, value: "24/7", label: "Support Available" },
    { icon: <Shield className="w-6 h-6" />, value: "99.9%", label: "Accuracy Rate" }
  ];

  const handleChatClick = useCallback(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 dark:from-primary-800 dark:via-primary-700 dark:to-primary-900 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Your AI-Powered Health Companion
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">
              Get instant health guidance, find nearby hospitals, and access mental health support - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-primary-600 dark:bg-white dark:hover:bg-gray-100 dark:text-primary-600 transform transition hover:scale-105"
                onClick={handleChatClick}
              >
                <MessageSquareText className="mr-2 h-5 w-5" />
                Chat with AI Assistant
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10 transform transition hover:scale-105"
                asChild
              >
                <Link href="/hospitals">
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Find Hospitals
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 transform transition hover:scale-105"
              >
                <div className="text-primary-600 dark:text-primary-400 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Comprehensive Health Support
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Everything you need for your health journey, powered by advanced AI technology
          </p>
          <FeaturesGrid features={features} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            See what our users have to say about their experience
          </p>
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 dark:from-primary-800 dark:via-primary-700 dark:to-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to take charge of your health?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust AI Health Assistant for reliable health guidance, hospital bookings, and wellness support.
          </p>
          {user ? (
            <Button
              asChild
              className="px-10 py-6 text-lg text-primary-600 bg-white rounded-xl shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 font-medium transition transform hover:scale-105"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="px-10 py-6 text-lg text-primary-600 bg-white rounded-xl shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 font-medium transition transform hover:scale-105"
            >
              <Link href="/login">Get Started Now</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
