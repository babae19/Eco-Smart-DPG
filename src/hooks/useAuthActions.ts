
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SignupMetadata } from '@/types/AuthTypes';

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signup = async (name: string, email: string, password: string, metadata: SignupMetadata) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            country: metadata.country,
            city: metadata.city,
            phone: metadata.phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Signup completed successfully
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { hasData: !!data, error });

      if (error) {
        console.error('Supabase auth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw new Error(error.message || 'Failed to sign in');
      }

      if (!data.session) {
        throw new Error('No session created. Please check your credentials.');
      }

      console.log('Login successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
      console.error('Login error details:', {
        message: errorMessage,
        error: error
      });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // Logout completed successfully
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      console.error('Logout error:', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, login, logout, isLoading };
};
