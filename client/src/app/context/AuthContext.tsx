import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { getStoredUser, logout as apiLogout } from '../services/api';

type AuthRole = 'admin' | 'volunteer';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: AuthRole;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const stored = getStoredUser();
    if (!user && stored) {
      setUser(stored);
    }
  }, [user]);

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, logout, isAdmin: !!user && user.role === 'admin' }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
