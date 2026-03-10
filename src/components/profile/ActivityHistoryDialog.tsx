import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ActivityHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ActivityHistoryDialog: React.FC<ActivityHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity History</DialogTitle>
          <DialogDescription>Your recent activities and contributions</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 my-4 px-1">
          <div className="border-l-2 border-green-500 pl-3 sm:pl-4 py-2">
            <p className="text-sm font-medium">Reported a flooding issue</p>
            <p className="text-xs text-gray-500">2 days ago · Kroo Bay</p>
          </div>
          
          <div className="border-l-2 border-green-500 pl-3 sm:pl-4 py-2">
            <p className="text-sm font-medium">Joined tree planting campaign</p>
            <p className="text-xs text-gray-500">1 week ago · Hill Station</p>
          </div>
          
          <div className="border-l-2 border-green-500 pl-3 sm:pl-4 py-2">
            <p className="text-sm font-medium">Saved 5 environmental tips</p>
            <p className="text-xs text-gray-500">2 weeks ago</p>
          </div>
          
          <div className="border-l-2 border-green-500 pl-3 sm:pl-4 py-2">
            <p className="text-sm font-medium">Reported waste management issue</p>
            <p className="text-xs text-gray-500">1 month ago · Congo Cross</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityHistoryDialog;
