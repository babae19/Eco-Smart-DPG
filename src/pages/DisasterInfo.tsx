
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { AlertTriangle, MapPin, Calendar, Info, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface DisasterData {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  time: string;
  location: string;
  locationDetails: string;
  status: string;
  updates: string[];
  safetyTips: string[];
  type: string;
}

const DisasterInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock data - in a real app, you would fetch this from an API
  const disasterData: DisasterData = {
    id: "1",
    title: "Flood Warning",
    description: "Heavy rainfall expected in coastal areas for the next 48 hours. Potential for flash floods in low-lying areas and near streams and rivers.",
    severity: "high",
    date: "June 9, 2023",
    time: "10:30 AM",
    location: "Coastal Regions",
    locationDetails: "Particularly affecting Bay Area, Santa Cruz, and Monterey counties",
    status: "Ongoing",
    updates: [
      "June 9, 10:30 AM: Initial flood warning issued.",
      "June 9, 2:15 PM: Rainfall intensity increased, evacuation recommended for zones A and B.",
      "June 9, 6:00 PM: Several roads closed due to flooding. See map for details."
    ],
    safetyTips: [
      "Avoid walking or driving through flood waters.",
      "Move to higher ground if in a flood-prone area.",
      "Prepare an emergency kit with water, food, and medications.",
      "Keep important documents in a waterproof container.",
      "Follow instructions from local emergency management officials."
    ],
    type: "flood"
  };
  
  const handleSubscribeUpdates = () => {
    toast({
      title: "Subscribed",
      description: "You'll receive updates about this disaster alert",
    });
  };

  const severityConfig = {
    high: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-700',
      icon: <AlertTriangle className="text-red-600" size={20} />,
      badge: 'bg-red-600 text-white'
    },
    medium: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-700',
      icon: <AlertTriangle className="text-orange-600" size={20} />,
      badge: 'bg-orange-600 text-white'
    },
    low: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-700',
      icon: <Info className="text-blue-600" size={20} />,
      badge: 'bg-blue-600 text-white'
    }
  };
  
  const config = severityConfig[disasterData.severity];
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Disaster Details" showBackButton />
      
      <div className={`${config.bg} ${config.border} border-b px-4 py-5`}>
        <div className="flex items-start">
          <div className="mr-3">
            {config.icon}
          </div>
          <div>
            <h1 className={`text-xl font-bold ${config.text}`}>{disasterData.title}</h1>
            <p className="text-gray-700 mt-1">{disasterData.description}</p>
            
            <div className="flex flex-wrap mt-3 gap-2">
              <span className={`text-xs py-1 px-3 rounded-full font-medium ${config.badge}`}>
                {disasterData.severity.toUpperCase()} SEVERITY
              </span>
              <span className="text-xs py-1 px-3 rounded-full font-medium bg-gray-200 text-gray-800">
                {disasterData.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          
          <div className="space-y-3">
            <div className="flex">
              <Calendar size={18} className="text-gray-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Date & Time</h3>
                <p className="text-sm text-gray-600">{disasterData.date} at {disasterData.time}</p>
              </div>
            </div>
            
            <div className="flex">
              <MapPin size={18} className="text-gray-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Location</h3>
                <p className="text-sm text-gray-600">{disasterData.location}</p>
                <p className="text-xs text-gray-500 mt-1">{disasterData.locationDetails}</p>
              </div>
            </div>
            
            <div className="flex">
              <Clock size={18} className="text-gray-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="text-sm text-gray-600">{disasterData.status}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Updates</h2>
          
          <div className="space-y-3">
            {disasterData.updates.map((update, index) => (
              <div key={index} className="border-l-2 border-green-500 pl-3 py-1">
                <p className="text-sm text-gray-700">{update}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Safety Tips</h2>
          
          <div className="space-y-2">
            {disasterData.safetyTips.map((tip, index) => (
              <div key={index} className="flex">
                <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={handleSubscribeUpdates}
          className="w-full"
        >
          Subscribe to Updates
        </Button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default DisasterInfo;
