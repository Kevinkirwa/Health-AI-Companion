import { useCallback, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeaturesGrid from "@/components/ui/features-grid";
import Testimonials from "@/components/ui/testimonials";
import LoginModal from "@/components/ui/login-modal";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Calendar, Brain, Heart, MessageSquareText, CalendarPlus } from "lucide-react";

const HomePage = () => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "AI Health Chatbot",
      description: "Get instant responses to your health concerns with our AI-powered chatbot.",
      bgColorClass: "bg-primary-100 dark:bg-primary-900",
      iconColorClass: "text-primary-600 dark:text-primary-400"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Nearest Hospitals",
      description: "Find hospitals near you with real-time availability and directions.",
      bgColorClass: "bg-primary-100 dark:bg-primary-900",
      iconColorClass: "text-primary-600 dark:text-primary-400"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Mental Health Support",
      description: "Access resources, exercises, and AI guidance for mental wellness.",
      bgColorClass: "bg-blue-100 dark:bg-blue-900",
      iconColorClass: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <Heart className="w-6 h-6" />,
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
      rating: 5
    },
    {
      text: "Finding a nearby hospital at 2 AM during an emergency was a lifesaver. The directions were accurate and I got there quickly.",
      author: "Michael Davis",
      rating: 4.5
    },
    {
      text: "The mental health exercises helped me manage my anxiety during the pandemic. I use the breathing techniques daily now.",
      author: "Emily Rodriguez",
      rating: 5
    }
  ];

  const handleChatClick = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Your AI-Powered <span className="text-primary-600 dark:text-primary-400">Health Assistant</span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Experience healthcare reimagined with AI-powered symptom analysis, nearest hospital finder, and mental health support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild={!!user}
                  className="px-6 py-3 text-base font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition flex items-center justify-center"
                  onClick={user ? undefined : handleChatClick}
                >
                  {user ? (
                    <Link href="/chatbot">
                      <i className="fas fa-comment-medical mr-2"></i> Chat with AI
                    </Link>
                  ) : (
                    <>
                      <i className="fas fa-comment-medical mr-2"></i> Chat with AI
                    </>
                  )}
                </Button>
                <Button 
                  asChild={!!user}
                  className="px-6 py-3 text-base font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-700 border border-primary-500 rounded-md hover:bg-primary-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition flex items-center justify-center"
                  onClick={user ? undefined : handleChatClick}
                >
                  {user ? (
                    <Link href="/hospitals">
                      <i className="fas fa-calendar-plus mr-2"></i> Book Appointment
                    </Link>
                  ) : (
                    <>
                      <i className="fas fa-calendar-plus mr-2"></i> Book Appointment
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="AI Health Assistant" 
                className="w-full h-auto rounded-lg shadow-xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Our Smart Health Features
          </h2>
          <FeaturesGrid features={features} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary-600 dark:bg-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to take charge of your health?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust AI Health Assistant for reliable health guidance, hospital bookings, and wellness support.
          </p>
          {user ? (
            <Button
              asChild
              className="px-8 py-3 text-primary-600 bg-white rounded-md shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 font-medium transition"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button
              className="px-8 py-3 text-primary-600 bg-white rounded-md shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 font-medium transition"
              onClick={() => setShowLoginModal(true)}
            >
              Get Started Now
            </Button>
          )}
        </div>
      </section>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default HomePage;
