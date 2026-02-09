import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthContextType } from './auth.types';
import { authService } from './auth.service';
import { setAccessToken } from '../../lib/axios';
import { saveRefreshToken, getRefreshToken, clearRefreshToken } from '../../lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { access } = await authService.refreshToken(refreshToken);
          setAccessToken(access);
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          clearRefreshToken();
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { access, refresh, user: userData } = await authService.login(credentials);
    setAccessToken(access);
    saveRefreshToken(refresh);
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const { access, refresh, user: userData } = await authService.register(data);
    setAccessToken(access);
    saveRefreshToken(refresh);
    setUser(userData);
  };

  const logout = () => {
    setAccessToken(null);
    clearRefreshToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
