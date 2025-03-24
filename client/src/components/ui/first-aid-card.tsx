import { Button } from "@/components/ui/button";
import { FirstAidTip } from "@shared/schema";

interface FirstAidCardProps {
  tip: FirstAidTip;
  expanded?: boolean;
}

const FirstAidCard: React.FC<FirstAidCardProps> = ({ tip, expanded = false }) => {
  const { title, category, content, steps } = tip;
  
  // Mini card view (only title and icon)
  if (!expanded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 rounded-full w-10 h-10 flex items-center justify-center mr-3">
            <i className={`fas fa-${getCategoryIcon(category)} text-red-600 dark:text-red-400 text-lg`}></i>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {truncateText(content, 80)}
        </p>
        <Button
          variant="link"
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center font-medium"
        >
          View Instructions <i className="fas fa-chevron-right ml-2 text-sm"></i>
        </Button>
      </div>
    );
  }
  
  // Full expanded card with all instructions
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-10">
      <div className="flex items-center mb-4">
        <div className="bg-red-100 dark:bg-red-900 rounded-full w-12 h-12 flex items-center justify-center mr-4">
          <i className={`fas fa-${getCategoryIcon(category)} text-red-600 dark:text-red-400 text-2xl`}></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      
      <div className="mb-6">
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 mb-4 border-l-4 border-red-500">
          <p className="text-red-700 dark:text-red-300 flex items-start">
            <i className="fas fa-exclamation-circle mt-1 mr-2"></i>
            <span>Call emergency services (911) immediately for severe situations. Early professional help is crucial.</span>
          </p>
        </div>
        
        <h3 className="font-medium text-lg mb-3 text-gray-900 dark:text-white">
          How to {title.toLowerCase()}:
        </h3>
        
        <div className="space-y-4">
          {steps && steps.map((step) => (
            <div key={step.step} className="flex">
              <div className="bg-red-100 dark:bg-red-900 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <span className="text-red-700 dark:text-red-300 font-bold">{step.step}</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
        >
          <i className="fas fa-play-circle mr-2"></i> Watch Video Guide
        </Button>
        <Button
          variant="outline"
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 flex items-center"
        >
          <i className="fas fa-print mr-2"></i> Print Instructions
        </Button>
      </div>
    </div>
  );
};

// Helper functions
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    bleeding: "droplet",
    burns: "fire-flame-simple",
    cpr: "heart-pulse",
    choking: "lungs",
    fractures: "bone",
    heatstroke: "temperature-high",
    default: "kit-medical"
  };
  
  return icons[category.toLowerCase()] || icons.default;
}

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export default FirstAidCard;
