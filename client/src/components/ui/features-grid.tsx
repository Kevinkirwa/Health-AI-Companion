import { ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  bgColorClass: string;
  iconColorClass: string;
}

interface FeaturesGridProps {
  features: Feature[];
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ features }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="bg-card dark:bg-gray-700 rounded-xl shadow-md p-6 transition-transform hover:scale-105"
        >
          <div className={`${feature.bgColorClass} rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
            <div className={feature.iconColorClass}>
              {feature.icon}
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesGrid;
