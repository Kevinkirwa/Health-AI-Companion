/**
 * Sound Effects utility for Health AI Companion
 * Provides audio feedback for various user interactions
 */

// Preloading audio for better performance
const audioCache: Record<string, HTMLAudioElement> = {};

// Available sound effects
export const SoundEffects = {
  BUTTON_CLICK: '/sounds/button-click.mp3',
  NOTIFICATION: '/sounds/notification.mp3',
  SUCCESS: '/sounds/success.mp3',
  ERROR: '/sounds/error.mp3',
  MESSAGE: '/sounds/message.mp3',
  APPOINTMENT_BOOKED: '/sounds/appointment-booked.mp3',
};

/**
 * Preload sound effects for better performance
 */
export const preloadSounds = () => {
  try {
    Object.values(SoundEffects).forEach(src => {
      if (!audioCache[src]) {
        const audio = new Audio();
        audio.src = src;
        audio.preload = 'auto';
        audioCache[src] = audio;
      }
    });
    console.log('Sound effects preloaded successfully');
  } catch (error) {
    console.error('Failed to preload sound effects:', error);
  }
};

/**
 * Play a sound effect
 * @param src - The source of the sound effect
 * @param volume - Volume level from 0 to 1
 */
export const playSound = (src: string, volume = 0.5) => {
  try {
    // Check if sound effects are enabled in user preferences
    const soundEnabled = localStorage.getItem('soundEffectsEnabled') !== 'false';
    
    if (!soundEnabled) return;
    
    // Use cached audio if available, otherwise create new
    const audio = audioCache[src] || new Audio(src);
    
    // Set volume
    audio.volume = volume;
    
    // Play the sound
    audio.currentTime = 0;
    audio.play().catch(error => {
      console.warn('Could not play sound effect:', error);
    });
    
    // Cache for future use if not already cached
    if (!audioCache[src]) {
      audioCache[src] = audio;
    }
  } catch (error) {
    console.error('Error playing sound effect:', error);
  }
};

/**
 * Toggle sound effects on/off
 * @param enabled - Whether sound effects should be enabled
 */
export const toggleSoundEffects = (enabled: boolean) => {
  localStorage.setItem('soundEffectsEnabled', String(enabled));
};

/**
 * Check if sound effects are enabled
 * @returns boolean indicating if sound effects are enabled
 */
export const areSoundEffectsEnabled = (): boolean => {
  return localStorage.getItem('soundEffectsEnabled') !== 'false';
};

// Initialize with sound effects enabled by default
if (localStorage.getItem('soundEffectsEnabled') === null) {
  localStorage.setItem('soundEffectsEnabled', 'true');
}
