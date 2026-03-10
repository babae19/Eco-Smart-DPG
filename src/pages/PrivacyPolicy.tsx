
import React from 'react';
import Header from '@/components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Privacy Policy" showBackButton />
      
      <ScrollArea className="h-[calc(100vh-64px)] px-4">
        <div className="max-w-3xl mx-auto py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600 mb-6">Effective Date: 18th April 2025</p>
            
            <div className="prose prose-gray max-w-none">
              <p>Eco Smart ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use the Eco Smart App ("App").</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
              <p>1.1 Personal Information: When creating an account, we may collect your name, email address, phone number, and location.</p>
              <p>1.2 Usage Data: We may collect data about how you interact with the App, including your device type, operating system, IP address, and activity within the App.</p>
              <p>1.3 Voluntary Information: Information submitted through features like "Report Climate Issues" or "Lunch Climate Campaign".</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
              <p>2.1 To provide and improve the App's functionality, including weather alerts, educational resources, and community engagement tools.</p>
              <p>2.2 To communicate with you, including sending notifications, updates, and responses to your inquiries.</p>
              <p>2.3 To analyze usage trends and improve the App's performance and user experience.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Sharing and Disclosure</h2>
              <p>3.1 We do not sell or rent your personal information to third parties.</p>
              <p>3.2 We may share information with trusted third-party partners to improve the App's functionality or with authorities in compliance with legal obligations.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
              <p>4.1 We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction.</p>
              <p>4.2 While we strive to protect your data, no method of transmission over the internet or electronic storage is 100% secure.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">5. User Rights</h2>
              <p>5.1 You have the right to access, update, or delete your personal information by contacting us at info@eco-smartapp.com.</p>
              <p>5.2 You may opt out of receiving notifications or communications by adjusting your account settings.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Retention of Data</h2>
              <p>6.1 We retain your information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Changes to the Privacy Policy</h2>
              <p>7.1 We may update this Privacy Policy periodically. Continued use of the App after changes constitutes acceptance of the revised Privacy Policy.</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PrivacyPolicy;
