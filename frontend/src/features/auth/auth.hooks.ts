import { useAuth } from './auth.context';
import { useEffect } from 'react';
import { useNavigate } from './useNavigate';

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};

export const useRequireRole = (allowedRoles: string[]) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, isLoading, allowedRoles, navigate]);

  return { user, isLoading };
};
