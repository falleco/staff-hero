import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { createId, ensureUserData } from '~/data/storage/user-data-store';

interface AuthUser {
  id: string;
  is_anonymous: boolean;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_KEY = 'staff-hero:auth:user';

async function createAnonymousUser(): Promise<AuthUser> {
  const now = new Date().toISOString();
  const user: AuthUser = {
    id: createId('user'),
    is_anonymous: true,
    created_at: now,
  };

  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  await ensureUserData(user.id);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          await ensureUserData(parsed.id);
          if (isMounted) {
            setUser(parsed);
          }
        } else {
          const created = await createAnonymousUser();
          if (isMounted) {
            setUser(created);
          }
        }
      } catch (error) {
        console.error('Failed to initialise auth state', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const signInAnonymously = async () => {
    try {
      const created = await createAnonymousUser();
      setUser(created);
    } catch (error) {
      console.error('Error creating anonymous user:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  const isAnonymous = user?.is_anonymous ?? true;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAnonymous,
        signInAnonymously,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
