
import React from 'react';
import { CalendarClock, Sparkles } from 'lucide-react';
import { useRealtimeDateTime } from '@/hooks/useRealtimeDateTime';

const HomeHeader: React.FC = () => {
  const { formattedDate, formattedTime } = useRealtimeDateTime();
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-xl">
      {/* Decorative gradient orbs */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-2xl"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 px-6 py-8">
        {/* Date and time badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <CalendarClock className="h-4 w-4 text-white/90" />
          <span className="text-sm font-medium text-white/95">
            {formattedDate} • {formattedTime}
          </span>
        </div>
        
        {/* Main content */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to EcoSmart
            </h1>
          </div>
          <p className="max-w-2xl text-base text-white/80 sm:text-lg">
            Your intelligent platform for real-time climate insights and disaster preparedness
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
