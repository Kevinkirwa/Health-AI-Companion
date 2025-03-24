import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BreathingExercise from "@/components/ui/breathing-exercise";
import { MentalHealthResource } from "@shared/schema";

const MentalHealthPage = () => {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

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

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-mental-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Mental Health & Wellness
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Access resources, exercises, and AI guidance to support your mental wellbeing and develop healthy coping strategies.
          </p>
        </div>
        
        {/* Quick Wellness Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg border border-purple-100 dark:border-purple-900">
            <div className="bg-mental-100 dark:bg-mental-900 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <i className="fas fa-lungs text-mental-600 dark:text-mental-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Breathing Exercise</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Guided breathing to help reduce anxiety and stress in just 5 minutes.</p>
            <Button 
              onClick={() => setSelectedResource("breathing")}
              className="w-full py-2 bg-mental-500 hover:bg-mental-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2"
            >
              Start Exercise
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg border border-purple-100 dark:border-purple-900">
            <div className="bg-mental-100 dark:bg-mental-900 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <i className="fas fa-brain text-mental-600 dark:text-mental-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Mood Tracker</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Track your daily moods and emotions to identify patterns and improvements.</p>
            <Button 
              onClick={() => setSelectedResource("mood")}
              className="w-full py-2 bg-mental-500 hover:bg-mental-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2"
            >
              Log Your Mood
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg border border-purple-100 dark:border-purple-900">
            <div className="bg-mental-100 dark:bg-mental-900 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <i className="fas fa-headphones text-mental-600 dark:text-mental-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Guided Meditation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">AI-guided meditation sessions for relaxation, focus, and sleep improvement.</p>
            <Button 
              onClick={() => setSelectedResource("meditation")}
              className="w-full py-2 bg-mental-500 hover:bg-mental-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2"
            >
              Start Meditation
            </Button>
          </div>
        </div>
        
        {/* Interactive Breathing Exercise */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            <i className="fas fa-lungs text-mental-500 mr-2"></i> Interactive Breathing Exercise
          </h2>
          <BreathingExercise />
        </div>
        
        {/* Daily Mental Health Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            <i className="fas fa-lightbulb text-yellow-500 mr-2"></i> Daily Mental Health Tips
          </h2>
          <div className="border-l-4 border-mental-500 pl-4 py-2 mb-6">
            <p className="text-lg italic text-gray-700 dark:text-gray-300">
              {dailyTip?.content || "Practice self-compassion. Treat yourself with the same kindness and understanding you would offer to a good friend."}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Today's tip by AI Health Assistant</p>
          </div>
          
          <Tabs defaultValue="stress">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="stress">Manage Stress</TabsTrigger>
              <TabsTrigger value="sleep">Improve Sleep</TabsTrigger>
            </TabsList>
            <TabsContent value="stress">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Manage Stress</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>Identify your stress triggers and develop coping strategies</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>Practice regular mindfulness or meditation</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>Maintain a consistent sleep schedule</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="sleep">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Improve Sleep</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>Create a relaxing bedtime routine</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>Limit screen time before bed</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                    <span>Maintain a cool, dark, and quiet bedroom</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Mental Health Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-purple-100 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-900 dark:text-white">Talk to a Professional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with licensed mental health professionals for personalized support and guidance.
              </p>
              <Button 
                className="w-full py-2 bg-mental-500 hover:bg-mental-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2"
              >
                Find Therapists
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-purple-100 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-900 dark:text-white">Self-Care Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access our library of self-care activities, articles, and resources for mental wellness.
              </p>
              <Button 
                className="w-full py-2 bg-mental-500 hover:bg-mental-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2"
              >
                Explore Resources
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-md border border-purple-100 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-900 dark:text-white">Community Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Join moderated support groups to connect with others facing similar challenges.
              </p>
              <Button 
                className="w-full py-2 bg-mental-500 hover:bg-mental-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2"
              >
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MentalHealthPage;
