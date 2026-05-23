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

  const syncLocalProfile = async (): Promise<LocalUser | null> => {
    try {
      // Calling /me triggers SupabaseAuthMiddleware which automatically syncs the user if not exists
      const response = await api.get('/me');
      setLocalUser(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to sync user with local backend:', error);
      if (error.response?.status === 401) {
        setLocalUser(null);
        setSupabaseUser(null);
        await supabase.auth.signOut();
      }
      return null;
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSupabaseUser(session.user);
        // Fetch local user details
        fetchLocalProfile().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setSupabaseUser(session.user);
        await syncLocalProfile();
      } else {
        setSupabaseUser(null);
        setLocalUser(null);
      }
      setLoading(false);
    });

    return () => {
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
