
import { SignupMetadata } from '@/types/AuthTypes';
import { User, Session } from '@supabase/supabase-js';

export interface IAuthService {
  signup(name: string, email: string, password: string, metadata: SignupMetadata): Promise<void>;
  login(email: string, password: string): Promise<{ user: User | null; session: Session | null }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  deleteAccount(): Promise<void>;
}

export interface IDatabaseService {
  // Generic database operations can be added here
  fetchUserProfiles(): Promise<any[]>;
  getUserDataForExport(userId: string): Promise<any>;
}
