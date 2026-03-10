import { useEffect, useRef } from 'react';

interface NotificationSoundProps {
  shouldPlay: boolean;
  volume?: number;
}

const NotificationSound: React.FC<NotificationSoundProps> = ({ 
  shouldPlay, 
  volume = 0.3 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for notification sound
    if (shouldPlay && 'AudioContext' in window) {
      playNotificationSound();
    }
  }, [shouldPlay, volume]);

  const playNotificationSound = () => {
    try {
      // Create a simple notification beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency for a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      // Set volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  return null; // This component doesn't render anything
};

export default NotificationSound;