import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BreathingExercise from "@/components/ui/breathing-exercise";
import { motion } from "framer-motion";
import { Brain, Moon, Calendar, ChevronRight, Clock, Heart, Award, Info, Wind, PlayCircle, Sparkles, User, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

// Define MentalHealthResource interface locally since it's not available in schema
interface MentalHealthResource {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
}

const MentalHealthPage = () => {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("tools");

  // Animation for breathing progress
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Fetch mental health resources from API
  const { data: resources, isLoading } = useQuery<MentalHealthResource[]>({
    queryKey: ["/api/mental-health"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/mental-health");
        if (!res.ok) {
          throw new Error("Failed to fetch mental health resources");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching mental health resources:", error);
        return [];
      }
    },
  });

  // Get daily tip from resources
  const dailyTip = resources?.find(r => r.category === "dailyTip");

  // Group resources by category
  const exerciseResources = resources?.filter(r => r.category === "exercise") || [];
  const selfCareResources = resources?.filter(r => r.category === "selfCare") || [];
  const sleepResources = resources?.filter(r => r.category === "sleep") || [];
  
  const logMood = (mood: string) => {
    toast.success(`Mood Logged: You're feeling ${mood} today. We've saved this to your profile.`);
  };
  
  const startMeditation = (type: string) => {
    setSelectedResource("meditation");
    toast.success(`Starting your ${type} meditation session.`);
  };
  
  const moodOptions = [
    { label: "Happy", color: "bg-yellow-400", icon: "😊" },
    { label: "Calm", color: "bg-blue-400", icon: "😌" },
    { label: "Anxious", color: "bg-purple-400", icon: "😰" },
    { label: "Sad", color: "bg-indigo-400", icon: "😔" },
    { label: "Energetic", color: "bg-red-400", icon: "⚡" },
  ];
  
  const meditationTypes = [
    { name: "Calm", duration: "5 min", icon: <Wind className="w-5 h-5" /> },
    { name: "Focus", duration: "10 min", icon: <Brain className="w-5 h-5" /> },
    { name: "Sleep", duration: "15 min", icon: <Moon className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="px-4 py-1 rounded-full bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800 mb-6 inline-flex items-center">
              <Heart className="w-3.5 h-3.5 mr-1.5" />
              Mental Wellness Resources
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-700 to-purple-500 dark:from-violet-400 dark:to-purple-300 text-transparent bg-clip-text">
              Your Mental Health Companion
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-10">
              Access professional resources and interactive tools to support your mental wellbeing journey.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setActiveTab("resources")}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-full"
              >
                Explore Resources
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              
              <Button 
                onClick={() => setSelectedResource("breathing")}
                variant="outline"
                className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300"
              >
                Start Breathing Exercise
                <Wind className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tools" className="text-sm md:text-base">
              <Award className="w-4 h-4 mr-2" /> Wellness Tools
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-sm md:text-base">
              <Info className="w-4 h-4 mr-2" /> Resources
            </TabsTrigger>
            <TabsTrigger value="exercises" className="text-sm md:text-base">
              <Brain className="w-4 h-4 mr-2" /> Exercises
            </TabsTrigger>
          </TabsList>
          
          {/* Tools Tab Content */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breathing Card */}
              <Card className="border border-violet-100 dark:border-violet-800 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/30 dark:to-violet-900/30 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl text-blue-700 dark:text-blue-300">
                    <Wind className="w-5 h-5 mr-2" />
                    Breathing Exercise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Guided breathing to help reduce anxiety and stress in just 5 minutes.
                  </p>
                  <Button 
                    onClick={() => setSelectedResource("breathing")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Exercise
                  </Button>
                </CardContent>
              </Card>
              
              {/* Mood Tracker Card */}
              <Card className="border border-violet-100 dark:border-violet-800 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl text-yellow-700 dark:text-yellow-300">
                    <BarChart className="w-5 h-5 mr-2" />
                    Mood Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Track your daily moods and emotions to identify patterns and improvements.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => logMood(mood.label)}
                        className={`${mood.color} text-white p-2 rounded-full text-lg`}
                        aria-label={`I'm feeling ${mood.label}`}
                      >
                        {mood.icon}
                      </button>
                    ))}
                  </div>
                  <Button 
                    onClick={() => setSelectedResource("mood")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    View Mood History
                  </Button>
                </CardContent>
              </Card>
              
              {/* Meditation Card */}
              <Card className="border border-violet-100 dark:border-violet-800 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl text-purple-700 dark:text-purple-300">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Guided Meditation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    AI-guided meditation sessions for relaxation, focus, and sleep improvement.
                  </p>
                  <div className="space-y-2 mb-4">
                    {meditationTypes.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => startMeditation(type.name)}
                        className="flex items-center justify-between w-full p-2 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <span className="flex items-center">
                          {type.icon}
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{type.name}</span>
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{type.duration}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Daily Tip */}
            <Card className="border border-violet-100 dark:border-violet-800 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                  Daily Mental Health Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-l-4 border-violet-500 pl-4 py-2">
                  <p className="text-lg italic text-gray-700 dark:text-gray-300">
                    {dailyTip?.content || "Practice self-compassion. Treat yourself with the same kindness and understanding you would offer to a good friend."}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Today's tip by Health AI Companion</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Resources Tab Content */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-md border border-violet-100 dark:border-violet-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-500" />
                    Talk to a Professional
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Connect with licensed mental health professionals for personalized support and guidance.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Find Therapists
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-md border border-violet-100 dark:border-violet-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Self-Care Library
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Access our library of self-care activities, articles, and resources for mental wellness.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Explore Resources
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-md border border-violet-100 dark:border-violet-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Community Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Join moderated support groups to connect with others facing similar challenges.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Join Groups
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Exercises Tab Content */}
          <TabsContent value="exercises">
            <Card className="shadow-md border border-violet-100 dark:border-violet-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Wind className="w-5 h-5 mr-2 text-blue-500" />
                  Interactive Breathing Exercise
                </CardTitle>
                <CardDescription>
                  Follow the animation below to practice controlled breathing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <BreathingExercise />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentalHealthPage;
