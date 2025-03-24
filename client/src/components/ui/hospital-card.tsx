import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Hospital } from "@shared/schema";
import { Phone, Map } from "lucide-react";

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ hospital }) => {
  const {
    id,
    name,
    address,
    openHours,
    specialties,
    rating,
    phone,
    distance
  } = hospital;

  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    
    return stars;
  };

  // Extract icon based on hospital type
  const getHospitalIcon = () => {
    if (name.toLowerCase().includes("general")) {
      return <i className="fas fa-hospital-alt text-primary-500 mr-2"></i>;
    } else if (name.toLowerCase().includes("urgent")) {
      return <i className="fas fa-stethoscope text-primary-500 mr-2"></i>;
    } else {
      return <i className="fas fa-clinic-medical text-primary-500 mr-2"></i>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
          {getHospitalIcon()}
          {name}
        </h3>
        <span className="text-green-500 text-sm flex items-center">
          <i className="fas fa-circle mr-1 text-xs"></i> {openHours || "Open 24/7"}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
        <i className="fas fa-map-marker-alt mr-1"></i> {address} - {distance || "3.2 km away"}
      </p>
      
      <div className="mb-3 flex items-center text-sm">
        <div className="flex text-yellow-400 mr-1">
          {renderStars(rating || 4.5)}
        </div>
        <span className="text-gray-600 dark:text-gray-300">{rating || 4.5} ({Math.floor(Math.random() * 100) + 50} reviews)</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {(specialties || ["General Care", "Emergency", "Pediatrics"]).map((specialty, index) => (
          <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
            {specialty}
          </Badge>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          asChild
          className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition flex-grow"
        >
          <Link href={`/booking/${id}`}>
            <i className="fas fa-calendar-plus mr-1"></i> Book Appointment
          </Link>
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition"
        >
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition"
        >
          <Map className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default HospitalCard;
