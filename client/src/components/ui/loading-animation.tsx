import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  className?: string;
}

/**
 * Animated loading component with customizable appearance
 */
export const LoadingAnimation = ({
  size = 'md',
  color = 'primary',
  text,
  className,
}: LoadingAnimationProps) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  // Color mappings (using Tailwind CSS classes)
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    white: 'text-white',
    black: 'text-black',
  };

  // Animation for dots
  const bounceAnimation = {
    y: [0, -10, 0],
  };

  // Staggered timing for dots
  const transition = (delay: number) => ({
    duration: 0.8,
    repeat: Infinity,
    repeatType: 'loop' as const,
    ease: 'easeInOut',
    delay,
  });

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="flex items-center justify-center space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-current',
              sizeMap[size],
              colorMap[color as keyof typeof colorMap] || 'text-primary'
            )}
            animate={bounceAnimation}
            transition={transition(i * 0.15)}
          />
        ))}
      </div>
      
      {text && (
        <motion.p 
          className="mt-4 text-center font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Skeleton loading animation for content
 */
export const SkeletonLoader = ({ 
  className, 
  count = 1,
  height = 'h-6'
}: { 
  className?: string;
  count?: number;
  height?: string;
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('bg-gray-200 dark:bg-gray-700 rounded w-full', height)}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pulse loading effect for buttons or components
 */
export const PulseLoader = ({ 
  children,
  isLoading = true,
}: { 
  children: React.ReactNode;
  isLoading?: boolean;
}) => {
  if (!isLoading) return <>{children}</>;
  
  return (
    <motion.div
      animate={{ 
        scale: [1, 0.98, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        repeatType: "loop" 
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Circle spinner animation
 */
export const SpinnerAnimation = ({ 
  size = 'md', 
  color = 'primary',
  className
}: { 
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  // Color mappings
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    white: 'text-white',
    black: 'text-black',
  };

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <motion.div
        className={cn(
          'border-t-2 border-b-2 rounded-full',
          sizeMap[size],
          colorMap[color as keyof typeof colorMap] || 'text-primary'
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};
