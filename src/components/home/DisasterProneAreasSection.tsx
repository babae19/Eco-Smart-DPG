
import React, { useState } from 'react';
import { AlertTriangle, Map, ChevronRight } from 'lucide-react';
import { disasterProneAreas, allDisasterProneAreas } from './disaster-prone-areas/data';
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import AreasDialog from './disaster-prone-areas/AreasDialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { getDisasterImage } from '@/services/weather/weatherIconUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const DisasterProneAreasSection: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArea, setSelectedArea] = useState<DisasterProneArea | null>(null);
  const [activeTab, setActiveTab] = useState("areas");
  const { isMobile } = useIsMobile();

  // Get primary risk for an area
  const getPrimaryRisk = (risks: string[]) => {
    return risks && risks.length > 0 ? risks[0] : 'Unknown';
  };

  // Risk styling helpers
  const getRiskColor = (risks: string[]) => {
    if (risks.some(risk => risk.toLowerCase().includes('flood'))) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (risks.some(risk => risk.toLowerCase().includes('landslide'))) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (risks.some(risk => risk.toLowerCase().includes('fire'))) return 'bg-red-50 text-red-700 border-red-200';
    if (risks.some(risk => risk.toLowerCase().includes('disease'))) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (risks.some(risk => risk.toLowerCase().includes('coast'))) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const handleViewDetails = (area: DisasterProneArea) => {
    setSelectedArea(area);
    setOpenDialog(true);
    setActiveTab("details");
  };

  return (
    <section className="mb-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
            <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Disaster-Prone Areas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              High-risk zones in Freetown
            </p>
          </div>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedArea(null);
            setOpenDialog(true);
            setActiveTab("areas");
          }}
          className="text-sm gap-1 hidden sm:flex"
        >
          View all <ChevronRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {disasterProneAreas.slice(0, 6).map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => handleViewDetails(area)}
            className="cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all h-full">
              <div className="h-36 sm:h-48 relative">
                <img
                  src={getDisasterImage(getPrimaryRisk(area.risks), area.name)}
                  alt={`${area.name} - ${getPrimaryRisk(area.risks)}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-white text-lg mb-2 line-clamp-1">
                    {area.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {area.risks.slice(0, 2).map((risk, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor([risk])} border`}
                      >
                        {risk}
                      </span>
                    ))}
                    {area.risks.length > 2 && (
                      <span className="text-xs text-white bg-black/30 px-2 py-1 rounded-full">
                        +{area.risks.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isMobile && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              setSelectedArea(null);
              setOpenDialog(true);
              setActiveTab("areas");
            }}
            className="w-full"
          >
            View All Disaster-Prone Areas
          </Button>
        </div>
      )}

      <AreasDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        areas={allDisasterProneAreas}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </section>
  );
};

export default DisasterProneAreasSection;
