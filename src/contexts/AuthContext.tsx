import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export interface LocalUser {
  id: string;
  supabase_auth_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  delivery_address: string | null;
  city: string | null;
  province: string | null;
  facebook_profile: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  localUser: LocalUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  fetchLocalProfile: () => Promise<LocalUser | null>;
  syncLocalProfile: () => Promise<LocalUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyingRef = React.useRef(false);
  const checkedRef = React.useRef(false);

  const fetchLocalProfile = async (): Promise<LocalUser | null> => {
    try {
      const response = await api.get('/me');
      setLocalUser(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch local user profile:', error);
      // If unauthorized, clear localUser and Supabase session
      if (error.response?.status === 401) {
        setLocalUser(null);
        setSupabaseUser(null);
        await supabase.auth.signOut();
      }
      return null;
    }
  };

  const syncLocalProfile = fetchLocalProfile;

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async (session: any) => {
      if (!isMounted) return;

      if (session?.user) {
        setSupabaseUser(session.user);
        
        // Prevent duplicate concurrent /me checks
        if (!checkedRef.current && !verifyingRef.current) {
          verifyingRef.current = true;
          setLoading(true);
          const profile = await fetchLocalProfile();
          if (isMounted) {
            verifyingRef.current = false;
            if (profile) {
              checkedRef.current = true;
            }
            setLoading(false);
          }
        } else if (checkedRef.current) {
          setLoading(false);
        }
      } else {
        setSupabaseUser(null);
        setLocalUser(null);
        checkedRef.current = false;
        verifyingRef.current = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // 1. Initial check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session);
    });

    // 2. Auth listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        handleAuth(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setLocalUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    supabaseUser,
    localUser,
    loading,
    isAuthenticated: !!supabaseUser,
    isAdmin: localUser?.role === 'admin',
    logout,
    fetchLocalProfile,
    syncLocalProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
