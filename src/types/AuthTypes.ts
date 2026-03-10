
import { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  admin?: boolean | null;
};

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export interface SignupMetadata {
  country: string;
  city: string;
  phone: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, metadata: SignupMetadata) => Promise<void>;
  logout: () => Promise<void>;
}
