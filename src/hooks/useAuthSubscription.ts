
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/AuthTypes';

export const useAuthSubscription = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let profileSubscription: any = null;
    let subscriptionRetries = 0;
    const maxRetries = 3;
    let profileFetched = false;

    const fetchProfile = async (userId: string) => {
      if (profileFetched) return;
      profileFetched = true;
      
      try {
        if (!profileSubscription) {
          profileSubscription = supabase
            .channel('profile-changes')
            .on('postgres_changes', 
                { 
                  event: '*', 
                  schema: 'public', 
                  table: 'profiles',
                  filter: `id=eq.${userId}` 
                }, 
                (payload) => {
                  if (payload.new) {
                    setProfile(payload.new as Profile);
                  }
                }
            )
            .subscribe((status) => {
              if (status === 'CHANNEL_ERROR' && subscriptionRetries < maxRetries) {
                subscriptionRetries++;
                console.info(`[useAuthSubscription] Profile subscription reconnecting... (${subscriptionRetries}/${maxRetries})`);
                setTimeout(() => {
                  if (profileSubscription && subscriptionRetries < maxRetries) {
                    supabase.removeChannel(profileSubscription);
                    profileSubscription = null;
                    profileFetched = false;
                    fetchProfile(userId);
                  }
                }, subscriptionRetries * 2000);
              } else if (status === 'SUBSCRIBED') {
                console.info('[useAuthSubscription] Profile subscription active');
              }
            });
        }

        // Fetch profile and admin role in parallel
        const [profileResult, roleResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle()
        ]);

        if (profileResult.error) {
          console.error('Error fetching profile:', profileResult.error);
          setProfile(null);
        } else if (profileResult.data) {
          setProfile(profileResult.data as Profile);
        } else {
          // No profile yet — will be auto-created by trigger on next sign-up
          setProfile(null);
        }

        // Set admin status from user_roles table (gracefully handle errors from RLS)
        if (roleResult.error) {
          console.warn('Could not check admin role:', roleResult.error.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!roleResult.data);
        }

      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !profileFetched) {
          fetchProfile(session.user.id);
        } else if (!session?.user) {
          setProfile(null);
          setIsAdmin(false);
          profileFetched = false;
          if (profileSubscription) {
            supabase.removeChannel(profileSubscription);
            profileSubscription = null;
          }
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []);

  return { user, profile, isAdmin, isLoading, session };
};
