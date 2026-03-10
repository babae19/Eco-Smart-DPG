
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/AuthTypes';
import { useAuthSubscription } from '@/hooks/useAuthSubscription';
import { useAuthActions } from '@/hooks/useAuthActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isLoading: subscriptionLoading } = useAuthSubscription();
  const { signup, login, logout, isLoading: actionLoading } = useAuthActions();

  const isLoading = subscriptionLoading || actionLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
