
// Helper function to get current time in user-friendly format
export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Check if a location is near Freetown (approximately)
export const isNearFreetown = (latitude: number, longitude: number): boolean => {
  return latitude > 8.4 && latitude < 8.5 && 
         longitude > -13.3 && longitude < -13.2;
};

// Generate AI confidence scores (simulated)
export const generateAIConfidence = (): number => {
  return 75 + Math.round(Math.random() * 20);
};
