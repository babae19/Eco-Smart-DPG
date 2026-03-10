
import React from 'react';
import Header from '@/components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Terms & Conditions" showBackButton />
      
      <ScrollArea className="h-[calc(100vh-64px)] px-4">
        <div className="max-w-3xl mx-auto py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
            <p className="text-gray-600 mb-6">Effective Date: 18th April 2025</p>
            
            <div className="prose prose-gray max-w-none">
              <p>Welcome to the Eco Smart App ("App"). These Terms and Conditions ("Terms") govern your use of the App and its associated services provided by Eco Smart ("we," "our," "us"). By downloading, accessing, or using the App, you agree to comply with and be bound by these Terms.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">1. User Eligibility</h2>
              <p>1.1 The App is intended for individuals aged 18 and above. Users under the age of 18 may use the App under the supervision of a parent or legal guardian.</p>
              <p>1.2 By using the App, you represent that you have the legal capacity to agree to these Terms.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">2. Use of the App</h2>
              <p>2.1 The App is designed to provide real-time weather alerts, disaster notifications, educational resources, emergency contacts, climate change news, and tools for reporting climate issues and launching campaigns.</p>
              <p>2.2 Users are prohibited from:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Misusing the App for unlawful purposes.</li>
                <li>Uploading harmful content, including viruses or other malicious code.</li>
                <li>Using the App in ways that harm or disrupt other users' experience.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">3. Account Creation and Security</h2>
              <p>3.1 To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account.</p>
              <p>3.2 Notify us immediately of any unauthorized access or breach of security.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Intellectual Property</h2>
              <p>4.1 All content and materials within the App, including text, graphics, logos, and software, are the intellectual property of Eco-Smart Solution Sierra Leone or its licensors. Unauthorized reproduction, distribution, or modification is prohibited.</p>
              <p>4.2 Users retain ownership of any content they submit but grant Eco Smart a non-exclusive, royalty-free license to use, reproduce, and share the content for purposes related to the App's functionality.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">5. Limitation of Liability</h2>
              <p>5.1 Eco Smart does not guarantee the accuracy, reliability, or completeness of the information provided in the App.</p>
              <p>5.2 To the fullest extent permitted by law, Eco Smart will not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the App.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Termination</h2>
              <p>6.1 EcoSmart reserves the right to suspend or terminate access to the App for users who violate these Terms or engage in inappropriate behavior.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Changes to the Terms</h2>
              <p>7.1 We may update these Terms periodically. Continued use of the App after changes constitutes acceptance of the revised Terms.</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TermsAndConditions;
