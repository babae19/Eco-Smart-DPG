
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function useRealtimeDateTime() {
  const [dateTime, setDateTime] = useState(new Date());
  
  useEffect(() => {
    // Update the date/time every second
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formattedDate = format(dateTime, 'MMMM d, yyyy');
  const formattedTime = format(dateTime, 'h:mm:ss a');
  
  return { formattedDate, formattedTime, dateTime };
}
