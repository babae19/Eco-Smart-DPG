
import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { RealtimeDateTimeProvider } from '@/contexts/RealtimeDateTimeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { WeatherProvider } from '@/contexts/WeatherContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import ConsentBanner from '@/components/ConsentBanner';
import { aiDebuggingInitializer } from '@/services/aiDebug/initializeAIDebugging';
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy load pages for better performance and code splitting
const Home = lazy(() => import('@/pages/Home'));
const DisasterAlerts = lazy(() => import('@/pages/DisasterAlerts'));
const ReportsFeed = lazy(() => import('@/pages/ReportsFeed'));
const Report = lazy(() => import('@/pages/Report'));
const ReportDetail = lazy(() => import('@/pages/ReportDetail'));
const Profile = lazy(() => import('@/pages/Profile'));
const CampaignDetails = lazy(() => import('@/pages/CampaignDetails'));
const AllCampaigns = lazy(() => import('@/pages/AllCampaigns'));
const CreateCampaign = lazy(() => import('@/pages/CreateCampaign'));
const ContactUs = lazy(() => import('@/pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('@/pages/TermsAndConditions'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const Welcome = lazy(() => import('@/pages/Welcome'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AIDebugDashboard = lazy(() => import('@/pages/AIDebugDashboard'));
const Settings = lazy(() => import('@/pages/Settings'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const EnvironmentalTips = lazy(() => import('@/pages/EnvironmentalTips'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const MyListings = lazy(() => import('@/pages/MyListings'));

// Optimized loading fallback
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize AI debugging system
    aiDebuggingInitializer.initialize();
    console.log('App initialized successfully');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LocationProvider>
          <WeatherProvider>
            <RealtimeDateTimeProvider>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />

              {/* Protected routes with individual error boundaries */}
              <Route path="/" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Home />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <DisasterAlerts />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Notifications />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/reports-feed" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ReportsFeed />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ReportsFeed />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/report" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Report />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/report/:reportId" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ReportDetail />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <AllCampaigns />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/create-campaign" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <CreateCampaign />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/campaign/:id" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <CampaignDetails />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/debug" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <AIDebugDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <HelpCenter />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/environmental-tips" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <EnvironmentalTips />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/shop" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Shop />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/product/:id" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ProductDetail />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/my-listings" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <MyListings />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
          <ConsentBanner />
          </RealtimeDateTimeProvider>
          </WeatherProvider>
        </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
