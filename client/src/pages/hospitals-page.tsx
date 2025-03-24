import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HospitalCard from "@/components/ui/hospital-card";
import { Hospital } from "@shared/schema";
import { MapIcon, ListIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HospitalsPage = () => {
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [viewType, setViewType] = useState<"map" | "list">("map");
  const { toast } = useToast();

  // Fetch hospitals from API
  const { data: hospitals, isLoading, isError } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals", location, specialty],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (location) params.append("location", location);
        if (specialty && specialty !== "all") params.append("specialty", specialty);

        const res = await fetch(`/api/hospitals?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to fetch hospitals");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        throw error;
      }
    },
  });

  const handleSearch = () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search for hospitals",
        variant: "destructive",
      });
      return;
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
          toast({
            title: "Location Detected",
            description: "Your current location has been detected",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Could not detect your location. Please enter it manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Unavailable",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Find Hospitals Near You
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Locate the nearest hospitals, clinics, and emergency rooms based on your location and specific healthcare needs.
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8 shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLocationDetect}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </Button>
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="general">General Hospital</SelectItem>
                  <SelectItem value="emergency">Emergency Care</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                  <SelectItem value="dental">Dental</SelectItem>
                  <SelectItem value="cardiac">Cardiac Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition md:w-auto w-full"
            >
              <i className="fas fa-search mr-2"></i> Search
            </Button>
          </div>
        </div>
        
        {/* Map and List View Tabs */}
        <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className={`px-4 py-2 ${viewType === "map" ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"} font-medium`}
            onClick={() => setViewType("map")}
          >
            <MapIcon className="w-4 h-4 mr-2" /> Map View
          </Button>
          <Button
            variant="ghost"
            className={`px-4 py-2 ${viewType === "list" ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"} font-medium`}
            onClick={() => setViewType("list")}
          >
            <ListIcon className="w-4 h-4 mr-2" /> List View
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">Error loading hospitals</div>
            <Button onClick={() => handleSearch()}>Try Again</Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Map Container */}
            {viewType === "map" && (
              <div className="w-full md:w-3/5 bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center shadow-md">
                {/* This would be a Google Maps integration */}
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <i className="fas fa-map-marked-alt text-5xl mb-3"></i>
                  <p>Google Maps integration would appear here</p>
                  <p className="text-sm">(Showing nearby hospitals based on location)</p>
                </div>
              </div>
            )}
            
            {/* Hospital Results */}
            <div className={viewType === "map" ? "w-full md:w-2/5" : "w-full"}>
              {hospitals && hospitals.length > 0 ? (
                hospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <i className="fas fa-hospital-alt text-4xl mb-2"></i>
                    <p>No hospitals found for your search criteria</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or specialty filters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HospitalsPage;
