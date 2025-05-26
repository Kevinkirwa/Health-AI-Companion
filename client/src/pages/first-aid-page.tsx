import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FirstAidCard from "@/components/ui/first-aid-card";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Search, Phone, AlertTriangle, Info, Heart, ArrowRight, X, Filter, ExternalLink, PlusCircle, Bookmark } from "lucide-react";

// Define FirstAidTip interface locally since it might not be available in schema
interface FirstAidTip {
  id: number;
  title: string;
  content: string;
  category: string;
  steps?: string[];
  imageUrl?: string;
}

const FirstAidPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTipId, setExpandedTipId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("emergency");

  // Fetch first aid tips from API
  const { data: firstAidTips, isLoading } = useQuery<FirstAidTip[]>({
    queryKey: ["/api/first-aid"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/first-aid");
        if (!res.ok) {
          throw new Error("Failed to fetch first aid tips");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching first aid tips:", error);
        return [];
      }
    },
  });

  // Filter first aid tips based on search query and category
  const filteredTips = firstAidTips?.filter(tip => {
    const matchesSearch = searchQuery === "" || 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || tip.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Categories for filtering
  const categories = [
    { name: "CPR", value: "cpr", icon: <Heart className="w-4 h-4" /> },
    { name: "Bleeding", value: "bleeding", icon: <AlertTriangle className="w-4 h-4" /> },
    { name: "Burns", value: "burns", icon: <AlertTriangle className="w-4 h-4" /> },
    { name: "Choking", value: "choking", icon: <AlertTriangle className="w-4 h-4" /> },
    { name: "Fractures", value: "fractures", icon: <AlertTriangle className="w-4 h-4" /> },
    { name: "Heat Stroke", value: "heatstroke", icon: <AlertTriangle className="w-4 h-4" /> }
  ];
  
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            First Aid & Emergency Tips
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Access critical emergency information and step-by-step first aid instructions for common situations.
          </p>
        </div>
        
        {/* Emergency Numbers */}
        <div className="bg-red-100 dark:bg-red-900 rounded-xl p-6 mb-10 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-900 dark:text-red-100">
            <i className="fas fa-phone-alt mr-2"></i> Emergency Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">911</div>
              <p className="text-gray-700 dark:text-gray-300">General Emergency</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Poison Control</div>
              <p className="text-gray-700 dark:text-gray-300">1-800-222-1222</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Suicide Prevention</div>
              <p className="text-gray-700 dark:text-gray-300">988 or 1-800-273-8255</p>
            </div>
          </div>
        </div>
        
        {/* Search and Categories */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Input 
              type="text" 
              placeholder="Search for first aid topics (e.g., CPR, burns, choking)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant="outline"
                className={`px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 border border-red-200 dark:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                  selectedCategory === category.value ? "bg-red-50 dark:bg-red-900/30 border-red-500" : ""
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.value ? null : category.value
                )}
              >
                {category.name}
              </Button>
            ))}
            {selectedCategory && (
              <Button
                variant="ghost"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {/* Featured First Aid Card (Only show when a tip is expanded) */}
            {expandedTipId !== null && firstAidTips && (
              <FirstAidCard 
                tip={firstAidTips.find(tip => tip.id === expandedTipId)!} 
                expanded={true} 
              />
            )}
            
            {/* First Aid Tips Grid (Show when no tip is expanded or filtered results) */}
            {(expandedTipId === null || filteredTips?.length !== 1) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredTips && filteredTips.length > 0 ? (
                  filteredTips.map((tip) => (
                    <div key={tip.id} onClick={() => setExpandedTipId(tip.id)}>
                      <FirstAidCard tip={tip} expanded={false} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center">
                    <div className="text-red-500 mb-2">
                      {searchQuery 
                        ? `No first aid tips found for "${searchQuery}"` 
                        : "No first aid tips available"}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FirstAidPage;
