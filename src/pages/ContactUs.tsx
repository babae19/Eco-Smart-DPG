
import React from 'react';
import Header from '@/components/Header';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Contact Us" showBackButton />
      
      <ScrollArea className="h-[calc(100vh-64px)] px-4">
        <div className="max-w-3xl mx-auto py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h1>
            <p className="text-gray-600 mb-8">
              For questions or concerns about these Terms and Conditions or the Privacy Policy, contact us at:
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <a href="mailto:info@eco-smartapp.com" className="text-blue-600 hover:underline">
                    info@eco-smartapp.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <a href="tel:+23288580063" className="text-blue-600 hover:underline">
                    +232 88 580 063
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-700">Mailing Address</p>
                  <p className="text-gray-600">
                    5 Soldier Street<br />
                    Freetown, Sierra Leone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContactUs;
