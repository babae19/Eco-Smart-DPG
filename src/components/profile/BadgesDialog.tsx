
import React from 'react';
import { MapPin, Shield, BookOpen, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BadgesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BadgesDialog: React.FC<BadgesDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Badges & Achievements</DialogTitle>
          <DialogDescription>Recognition for your environmental contributions</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 sm:p-4 mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-2">
              <MapPin size={20} className="text-green-600 sm:size-24" />
            </div>
            <p className="text-xs sm:text-sm font-medium">Location Scout</p>
            <p className="text-xs text-gray-500">10+ reports</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-2">
              <Shield size={24} className="text-green-600" />
            </div>
            <p className="text-sm font-medium">Environment Guardian</p>
            <p className="text-xs text-gray-500">5+ campaigns</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-2">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium">Knowledge Seeker</p>
            <p className="text-xs text-gray-500">50+ tips saved (35/50)</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-2">
              <Award size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium">Climate Champion</p>
            <p className="text-xs text-gray-500">20+ actions (15/20)</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgesDialog;
