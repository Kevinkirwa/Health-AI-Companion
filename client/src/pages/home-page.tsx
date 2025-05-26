import { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import FeaturesGrid from "@/components/ui/features-grid";
import Testimonials from "@/components/ui/testimonials";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Calendar, Brain, Heart, MessageSquareText, CalendarPlus, Users, Clock, Shield, CheckCircle, ArrowRight } from "lucide-react";

// No need to import the image from assets since it's in the public directory

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
      <section className="relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <div className="max-w-xl mx-auto lg:mx-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight">
                  Your AI-Powered Health Companion
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                  Get instant health guidance, find nearby hospitals, and access mental health support - all in one place.
                </p>
                <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                  <Button
                    size="lg"
                    className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600 transform transition hover:scale-105 shadow-lg"
                    onClick={handleChatClick}
                  >
                    <MessageSquareText className="mr-2 h-5 w-5" />
                    Chat with AI Assistant
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-gray-800 transform transition hover:scale-105"
                    asChild
                  >
                    <Link href="/hospitals">
                      <CalendarPlus className="mr-2 h-5 w-5" />
                      Find Hospitals
                    </Link>
                  </Button>
                </div>
                
                {/* Feature highlights */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Instant health guidance", "Find nearby hospitals", "AI-powered chat support", "Secure patient data"].map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-300">
                <img 
                  src="./healthcare-hero.jpg" 
                  alt="Healthcare professionals using digital technology"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent mix-blend-overlay"></div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">50K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Satisfied Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary-100 dark:bg-primary-900/20 blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-70"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Trusted by Healthcare Professionals</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Our platform connects patients with healthcare providers through intelligent AI technology</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-8 rounded-2xl bg-white dark:bg-gray-700 shadow-lg transform transition hover:scale-105 hover:shadow-xl border border-gray-100 dark:border-gray-600"
              >
                <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-full text-primary-600 dark:text-primary-400 mb-5">
                  {stat.icon}
                </div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute left-0 top-1/4 -ml-24 h-80 w-80 rounded-full bg-primary-50 dark:bg-primary-900/10 blur-3xl opacity-70"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
              Comprehensive Health Support
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Everything you need for your health journey, powered by advanced AI technology
            </p>
            <div className="w-20 h-2 bg-primary-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className={`p-4 rounded-2xl mb-6 inline-flex ${feature.bgColorClass}`}>
                  <div className={feature.iconColorClass}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600"
              size="lg"
              asChild
            >
              <Link href="/dashboard">
                Explore All Features <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute right-0 top-1/3 -mr-24 h-80 w-80 rounded-full bg-blue-50 dark:bg-blue-900/10 blur-3xl opacity-70"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              See what our users have to say about their experience
            </p>
            <div className="w-20 h-2 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-600 relative">
                {/* Quote mark */}
                <div className="absolute -top-4 -left-4 text-5xl text-primary-300 dark:text-primary-500 opacity-50">"</div>
                
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(testimonial.rating) ? "text-yellow-500" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-200 italic mb-6">"{testimonial.text}"</p>
                
                <div className="flex items-center">
                  <div className="bg-gray-100 dark:bg-gray-600 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                      {testimonial.author.split(' ').map(name => name[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="./healthcare-hero.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-700/80 dark:from-gray-900/95 dark:to-primary-900/90"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Ready to take charge of your health?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of users who trust Health AI Companion for reliable health guidance, hospital bookings, and wellness support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-full px-8 py-6 shadow-lg transform transition hover:scale-105 hover:shadow-xl"
                >
                  <Link href="/dashboard">
                    <span className="flex items-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-full px-8 py-6 shadow-lg transform transition hover:scale-105 hover:shadow-xl"
                  >
                    <Link href="/login">
                      <span className="flex items-center">
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </Link>
                  </Button>
                  
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 font-semibold rounded-full px-8 py-6 transform transition hover:scale-105"
                  >
                    <Link href="/about">
                      <span className="flex items-center">
                        Learn More
                      </span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            <div className="mt-12 py-4 px-6 bg-white/10 backdrop-blur-sm rounded-2xl inline-block">
              <p className="text-white text-sm">HIPAA compliant & secure ⋅ 24/7 support ⋅ Easy to use</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
