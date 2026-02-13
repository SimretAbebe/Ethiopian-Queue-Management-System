import { useState, FormEvent } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building2, AlertCircle, User, Briefcase, Shield } from 'lucide-react';
import { UserRole } from '../features/auth/auth.types';

const roles: { value: UserRole; label: string; description: string; icon: typeof User }[] = [
  {
    value: 'citizen',
    label: 'Citizen',
    description: 'Get queue tickets and track your position',
    icon: User,
  },
  {
    value: 'officer',
    label: 'Officer',
    description: 'Manage queues and serve citizens',
    icon: Briefcase,
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'System administration and analytics',
    icon: Shield,
  },
];

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'citizen' as UserRole,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        password: formData.password,
        role: formData.role,
      });
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Registration failed. Username may already be in use.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Building2 className="h-10 w-10 text-blue-800" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Create Account</h1>
          <p className="text-gray-600">Join the SmartQueue Service system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">Register as</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.role === role.value
                      ? 'border-blue-800 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <role.icon className={`h-6 w-6 mx-auto mb-1 ${
                    formData.role === role.value ? 'text-blue-800' : 'text-gray-500'
                  }`} />
                  <p className={`text-sm font-medium ${
                    formData.role === role.value ? 'text-blue-800' : 'text-gray-700'
                  }`}>{role.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {roles.find(r => r.value === formData.role)?.description}
            </p>
          </div>

          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-800 font-medium hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};
