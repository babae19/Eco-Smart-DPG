
import { useState } from 'react';
import { SignupMetadata } from '@/types/AuthTypes';
import { authService } from '@/services/api';

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signup = async (name: string, email: string, password: string, metadata: SignupMetadata) => {
    setIsLoading(true);
    try {
      await authService.signup(name, email, password, metadata);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      console.error('Signup error:', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const { user, session } = await authService.login(email, password);
      console.log('Login successful', { user, session });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
      console.error('Login error details:', { message: errorMessage, error });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      console.error('Logout error:', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      await authService.deleteAccount();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      console.error('Delete account error:', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, login, logout, deleteAccount, isLoading };
};
