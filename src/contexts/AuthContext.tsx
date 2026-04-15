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
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' && parsed.username) {
          parsed.canManageEvents = ['SCOSEC', 'SCODIR'].includes(parsed.username);
          parsed.canManageUpdates = ['SCOGRAP', 'SCOMMA', 'SCODIR'].includes(parsed.username);
        }
        return parsed;
      } catch {
        return { role: null, isAuthenticated: false };
      }
    }
    return { role: null, isAuthenticated: false };
  });

  const login = useCallback((username: string, password: string): boolean => {
    if (ADMIN_USERS[username as keyof typeof ADMIN_USERS] === password) {
      const canManageEvents = ['SCOSEC', 'SCODIR'].includes(username);
      const canManageUpdates = ['SCOGRAP', 'SCOMMA', 'SCODIR'].includes(username);
      
      const state: AuthState = { 
        role: 'admin', 
        isAuthenticated: true, 
        username,
        canManageEvents,
        canManageUpdates
      };
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
