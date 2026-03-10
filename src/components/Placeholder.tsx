
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Home as HomeIcon, AlertTriangle } from 'lucide-react';

const Placeholder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we should redirect to an existing page
  useEffect(() => {
    const path = location.pathname;
    
    // If the path is one of our implemented pages that shouldn't show placeholder,
    // redirect to the actual page
    if (path === '/contact' || path === '/terms' || path === '/privacy') {
      // Just stay on the page - it will render the proper component from routes
    }
  }, [location, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="mb-6 bg-blue-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page Under Construction</h1>
        
        <p className="text-gray-600 mb-6">
          This feature is currently being developed and will be available soon. 
          Please check back later for updates.
        </p>
        
        <Button 
          onClick={() => navigate('/')} 
          className="flex items-center justify-center"
        >
          <HomeIcon className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default Placeholder;
