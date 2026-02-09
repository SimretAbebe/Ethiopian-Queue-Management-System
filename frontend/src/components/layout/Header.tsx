import { Building2, LogOut, User } from 'lucide-react';
import { useAuth } from '../../features/auth/auth.context';
import { Button } from '../ui/Button';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center space-x-3 group">
            <Building2 className="h-8 w-8 text-blue-800 transition-transform duration-300 group-hover:scale-110" />
            <div>
              <h1 className="text-xl font-bold text-black">Ethiopian Citizens Service</h1>
              <p className="text-xs text-gray-600">Queue Management System</p>
            </div>
          </a>

          <nav className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-800" />
                  <span className="text-sm font-medium text-black">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">({user.role})</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => (window.location.href = '/register')}
                >
                  Register
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
