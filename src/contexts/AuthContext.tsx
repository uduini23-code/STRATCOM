import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setViewerMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_USERS = {
  'SCOMMA': 'MediaTurtle@26',
  'SCOSEC': 'SCO*2O26',
  'SCOGRAP': 'GraphicsTURTS@26',
  'SCODIR': 'SCOD!R@26'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('sco_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { role: null, isAuthenticated: false };
      }
    }
    return { role: null, isAuthenticated: false };
  });

  const login = useCallback((username: string, password: string): boolean => {
    if (ADMIN_USERS[username as keyof typeof ADMIN_USERS] === password) {
      const state: AuthState = { role: 'admin', isAuthenticated: true, username };
      setAuth(state);
      localStorage.setItem('sco_auth', JSON.stringify(state));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    const state: AuthState = { role: null, isAuthenticated: false };
    setAuth(state);
    localStorage.setItem('sco_auth', JSON.stringify(state));
  }, []);

  const setViewerMode = useCallback(() => {
    const state: AuthState = { role: 'viewer', isAuthenticated: true };
    setAuth(state);
    localStorage.setItem('sco_auth', JSON.stringify(state));
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, setViewerMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
