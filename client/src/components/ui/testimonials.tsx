import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

interface Testimonial {
  text: string;
  author: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    
    // Full stars
    for (let i = 1; i <= Math.floor(rating); i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star"></i>);
    }
    
    // Half star
    if (rating % 1 !== 0) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt"></i>);
    }
    
    // Empty stars
    for (let i = Math.ceil(rating); i < 5; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800 shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mr-4">
                <span className="text-lg font-semibold">{testimonial.author.charAt(0)}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</h4>
                <div className="flex text-yellow-400">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "{testimonial.text}"
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Testimonials;
