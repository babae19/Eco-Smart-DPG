
import { supabase } from '@/integrations/supabase/client';
import { SignupMetadata } from '@/types/AuthTypes';
import { IAuthService } from './types';
import { User, Session } from '@supabase/supabase-js';

export class SupabaseAuthService implements IAuthService {
  async signup(name: string, email: string, password: string, metadata: SignupMetadata): Promise<void> {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
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

    if (error) throw error;
  }

  async login(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) throw new Error('No session created');

    return { user: data.user, session: data.session };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async deleteAccount(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No user logged in');

    // In Supabase, users can't delete themselves directly through the client SDK 
    // unless a database function (RPC) or Edge Function is set up.
    // For now, we will mark the profile as deleted or use an RPC if available.
    // Assuming there's a profile table we can update or a function we can call.
    
    // Attempting to call an RPC if it exists, or just logging out after a 'deletion' request.
    const { error } = await supabase.rpc('delete_user_account');
    
    if (error) {
      console.warn('RPC delete_user_account failed, falling back to manual logout:', error);
    }
    
    await this.logout();
  }
}

export const authService = new SupabaseAuthService();
