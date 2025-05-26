import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Fade In animation component
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration }}
  >
    {children}
  </motion.div>
);

// Slide Up animation component
export const SlideUp = ({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration }}
  >
    {children}
  </motion.div>
);

// Staggered children animation
export const StaggeredContainer = ({ 
  children, 
  staggerDelay = 0.1,
  initialDelay = 0
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  initialDelay?: number;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: initialDelay,
          staggerChildren: staggerDelay
        }
      }
    }}
  >
    {children}
  </motion.div>
);

// Item for staggered animation
export const StaggeredItem = ({ 
  children 
}: { 
  children: ReactNode; 
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
  >
    {children}
  </motion.div>
);

// Pulse animation (for buttons, notifications)
export const PulseAnimation = ({ 
  children,
  pulseDuration = 2
}: { 
  children: ReactNode; 
  pulseDuration?: number;
}) => (
  <motion.div
    animate={{ 
      scale: [1, 1.05, 1],
    }}
    transition={{ 
      duration: pulseDuration, 
      repeat: Infinity,
      repeatType: "loop" 
    }}
  >
    {children}
  </motion.div>
);

// Page transition wrapper
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Hover scale effect (for cards, buttons)
export const HoverScale = ({ 
  children, 
  scale = 1.05 
}: { 
  children: ReactNode;
  scale?: number;
}) => (
  <motion.div
    whileHover={{ scale }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    {children}
  </motion.div>
);

// Loading spinner with animation
export const LoadingSpinner = ({ 
  size = 40, 
  color = "currentColor" 
}: { 
  size?: number;
  color?: string;
}) => (
  <motion.div
    style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%', 
      border: `3px solid rgba(0, 0, 0, 0.1)`,
      borderTopColor: color,
    }}
    animate={{ rotate: 360 }}
    transition={{ 
      duration: 1, 
      repeat: Infinity, 
      ease: "linear" 
    }}
  />
);

// Notification pop animation
export const NotificationPop = ({ 
  children 
}: { 
  children: ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, y: -20 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  >
    {children}
  </motion.div>
);
