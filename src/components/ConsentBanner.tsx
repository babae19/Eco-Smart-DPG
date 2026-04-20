
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';

const ConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ecosmart_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ecosmart_consent', 'accepted');
    localStorage.setItem('ecosmart_data_sharing', 'true');
    setIsVisible(false);
    window.dispatchEvent(new Event('consent_updated'));
  };

  const handleDecline = () => {
    localStorage.setItem('ecosmart_consent', 'declined');
    localStorage.setItem('ecosmart_data_sharing', 'false');
    setIsVisible(false);
    window.dispatchEvent(new Event('consent_updated'));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-card border shadow-lg rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
        <div className="bg-primary/10 p-2 rounded-full hidden md:block">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-semibold text-sm">Privacy & Data Consent</h3>
          <p className="text-xs text-muted-foreground mt-1">
            We use cookies and process data to provide weather alerts and climate services. 
            By clicking accept, you agree to our <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={handleDecline} className="flex-1 md:flex-initial">
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept} className="flex-1 md:flex-initial">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
