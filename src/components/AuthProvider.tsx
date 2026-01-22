"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

      const fetchProfile = async (userId: string) => {
        if (!userId) return;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (!error && data) {
            setProfile(data);
          } else if (error && error.code === 'PGRST116') {
             // Profile might not be created yet by the trigger, retry once after a delay
             setTimeout(async () => {
               const { data: retryData } = await supabase
                 .from('profiles')
                 .select('*')
                 .eq('id', userId)
                 .single();
               if (retryData) setProfile(retryData);
             }, 2000);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };

  useEffect(() => {
    // Listen for auth state changes - this also handles the initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthProvider] Event: ${event}`, { hasSession: !!session });
      
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id); // Don't await, let it fetch in background
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    // Fallback: Ensure loading stops even if listener doesn't fire immediately
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id); // Don't await
        }
      } catch (e) {
        console.error("[AuthProvider] Session check error:", e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    window.location.href = "/";
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
