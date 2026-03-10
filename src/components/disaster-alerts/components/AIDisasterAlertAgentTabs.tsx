
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Users, Cloud, Shield } from 'lucide-react';

const AIDisasterAlertAgentTabs: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-4 mb-4">
      <TabsTrigger value="risks" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Risks
      </TabsTrigger>
      <TabsTrigger value="community" className="text-xs">
        <Users className="h-3 w-3 mr-1" />
        Reports
      </TabsTrigger>
      <TabsTrigger value="weather" className="text-xs">
        <Cloud className="h-3 w-3 mr-1" />
        Weather
      </TabsTrigger>
      <TabsTrigger value="safety" className="text-xs">
        <Shield className="h-3 w-3 mr-1" />
        Safety
      </TabsTrigger>
    </TabsList>
  );
};

export default AIDisasterAlertAgentTabs;
