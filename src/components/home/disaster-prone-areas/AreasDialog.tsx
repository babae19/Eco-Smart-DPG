
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import AreaList from './AreaList';
import AreaDetails from './AreaDetails';
import { useIsMobile } from '@/hooks/use-mobile';

interface AreasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedArea: DisasterProneArea | null;
  setSelectedArea: (area: DisasterProneArea | null) => void;
  areas: DisasterProneArea[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AreasDialog: React.FC<AreasDialogProps> = ({
  open,
  onOpenChange,
  selectedArea,
  setSelectedArea,
  areas,
  activeTab,
  setActiveTab
}) => {
  const { isMobile } = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-full h-[90vh] sm:max-w-lg' : 'sm:max-w-3xl'} max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            Disaster-Prone Areas
          </DialogTitle>
          <DialogDescription>
            Explore high-risk zones throughout Freetown and learn about specific environmental hazards
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="areas">All Areas</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedArea}>Area Details</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="areas" className="h-full m-0">
              <AreaList 
                areas={areas}
                onSelectArea={(area) => {
                  setSelectedArea(area);
                  setActiveTab("details");
                }}
              />
            </TabsContent>
            
            <TabsContent value="details" className="h-full m-0">
              {selectedArea && <AreaDetails area={selectedArea} />}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end mt-4 pt-2 border-t">
          <Button 
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedArea(null);
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreasDialog;
