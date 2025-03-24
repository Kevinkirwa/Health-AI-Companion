import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface BreathingExerciseProps {
  defaultDuration?: number;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ defaultDuration = 4 }) => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [duration, setDuration] = useState(defaultDuration);
  const [counter, setCounter] = useState(duration);
  const circleRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isBreathing) return;

    // Reset counter
    setCounter(duration);

    // Set up the breathing cycle
    const cycleDuration = phase === 'hold' ? duration * 1.75 : duration;
    
    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return Math.round(duration * 1.75); // Hold is longer (7s for 4-7-8 technique)
          } else if (phase === 'hold') {
            setPhase('exhale');
            return duration * 2; // Exhale is longest (8s for 4-7-8 technique)
          } else {
            setPhase('inhale');
            return duration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isBreathing, phase, duration]);

  useEffect(() => {
    if (!circleRef.current) return;

    // Animate the circle based on the current phase
    if (phase === 'inhale') {
      circleRef.current.style.transform = 'scale(1.3)';
      circleRef.current.style.transition = `transform ${duration}s ease-in`;
    } else if (phase === 'hold') {
      // No size change during hold
      circleRef.current.style.transition = 'none';
    } else if (phase === 'exhale') {
      circleRef.current.style.transform = 'scale(1)';
      circleRef.current.style.transition = `transform ${duration * 2}s ease-out`;
    }
  }, [phase, duration]);

  const toggleBreathing = () => {
    if (isBreathing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setPhase('inhale');
    }
    setIsBreathing(!isBreathing);
  };

  const getInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in through your nose';
      case 'hold':
        return 'Hold your breath';
      case 'exhale':
        return 'Exhale completely through your mouth';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center">
      <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
        <div className="flex justify-center">
          <div className="relative w-48 h-48 rounded-full border-8 border-mental-200 dark:border-mental-900 flex items-center justify-center">
            <div 
              ref={circleRef}
              className="w-32 h-32 bg-mental-500 dark:bg-mental-600 rounded-full flex items-center justify-center text-white font-bold transition-transform"
            >
              {isBreathing ? (
                <div className="text-center">
                  <div>{phase}</div>
                  <div className="text-2xl">{counter}</div>
                </div>
              ) : (
                "Breathe"
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="md:w-1/2">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Follow the expanding and contracting circle. Breathe in as it expands and breathe out as it contracts. This exercise uses the 4-7-8 technique:
        </p>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-4">
          <li className="flex items-start">
            <span className="bg-mental-100 dark:bg-mental-800 text-mental-800 dark:text-mental-200 font-bold rounded-full h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
            <span>Breathe in through your nose for 4 seconds</span>
          </li>
          <li className="flex items-start">
            <span className="bg-mental-100 dark:bg-mental-800 text-mental-800 dark:text-mental-200 font-bold rounded-full h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
            <span>Hold your breath for 7 seconds</span>
          </li>
          <li className="flex items-start">
            <span className="bg-mental-100 dark:bg-mental-800 text-mental-800 dark:text-mental-200 font-bold rounded-full h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
            <span>Exhale completely through your mouth for 8 seconds</span>
          </li>
        </ul>
        
        {isBreathing && (
          <div className="p-3 bg-mental-50 dark:bg-mental-900/30 rounded-lg mb-4 text-center">
            <p className="text-mental-700 dark:text-mental-300 font-medium">{getInstructions()}</p>
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button 
            className="px-4 py-2 bg-mental-500 text-white rounded-md hover:bg-mental-600 focus:outline-none focus:ring-2 focus:ring-mental-500 focus:ring-offset-2 transition"
            onClick={toggleBreathing}
          >
            {isBreathing ? 'Stop Exercise' : 'Start Exercise'}
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 border border-mental-300 dark:border-mental-700 text-mental-700 dark:text-mental-300 rounded-md hover:bg-mental-50 dark:hover:bg-mental-900 focus:outline-none focus:ring-2 focus:ring-mental-300 dark:focus:ring-mental-700 transition"
            onClick={() => setDuration(prev => Math.max(2, prev - 1))}
            disabled={isBreathing}
          >
            Faster
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 border border-mental-300 dark:border-mental-700 text-mental-700 dark:text-mental-300 rounded-md hover:bg-mental-50 dark:hover:bg-mental-900 focus:outline-none focus:ring-2 focus:ring-mental-300 dark:focus:ring-mental-700 transition"
            onClick={() => setDuration(prev => Math.min(10, prev + 1))}
            disabled={isBreathing}
          >
            Slower
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
