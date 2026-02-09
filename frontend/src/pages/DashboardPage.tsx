import { useAuth } from '../features/auth/auth.context';
import { CitizenDashboard } from './dashboards/CitizenDashboard';
import { OfficerDashboard } from './dashboards/OfficerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export const DashboardPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  switch (user.role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'officer':
      return <OfficerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-600">Invalid user role</p>
        </div>
      );
  }
};
