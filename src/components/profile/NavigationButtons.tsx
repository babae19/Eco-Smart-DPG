
import React from 'react';
import { Clock, Award, Settings, ChevronRight, FileText, Shield, MessageCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationButtonsProps {
  onSectionClick: (section: string) => void;
  onSettingsClick: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onSectionClick,
  onSettingsClick,
}) => {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="divide-y divide-gray-100">
        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => onSectionClick('activity')}
        >
          <div className="flex items-center">
            <Clock size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Activity History</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        
        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => onSectionClick('badges')}
        >
          <div className="flex items-center">
            <Award size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Badges & Achievements</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        
        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => handleNavigate('/my-listings')}
        >
          <div className="flex items-center">
            <FileText size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">My Listings</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        
        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => handleNavigate('/campaigns')}
        >
          <div className="flex items-center">
            <FileText size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">My Campaigns</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        
        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => handleNavigate('/help')}
        >
          <div className="flex items-center">
            <HelpCircle size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Help Center</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={onSettingsClick}
        >
          <div className="flex items-center">
            <Settings size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Settings</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => handleNavigate('/contact')}
        >
          <div className="flex items-center">
            <MessageCircle size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Contact Us</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => handleNavigate('/terms')}
        >
          <div className="flex items-center">
            <FileText size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Terms & Conditions</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button 
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          onClick={() => handleNavigate('/privacy')}
        >
          <div className="flex items-center">
            <Shield size={18} className="text-gray-500 mr-3" />
            <span className="text-gray-700">Privacy Policy</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default NavigationButtons;
