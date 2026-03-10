
import React, { createContext, useContext, useState, useEffect } from 'react';

interface RealtimeDateTimeContextProps {
  currentDateTime: Date;
  formattedTime: string;
  formattedDate: string;
}

const RealtimeDateTimeContext = createContext<RealtimeDateTimeContextProps>({
  currentDateTime: new Date(),
  formattedTime: '',
  formattedDate: '',
});

export const useRealtimeDateTime = () => useContext(RealtimeDateTimeContext);

export const RealtimeDateTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  
  // Update the time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // 1 minute = 60000 ms
    
    return () => clearInterval(intervalId);
  }, []);
  
  const formattedTime = currentDateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const formattedDate = currentDateTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <RealtimeDateTimeContext.Provider
      value={{
        currentDateTime,
        formattedTime,
        formattedDate,
      }}
    >
      {children}
    </RealtimeDateTimeContext.Provider>
  );
};
