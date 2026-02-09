import { Card } from '../../components/ui/Card';
import { Users, Building2, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../features/auth/auth.context';

const stats = [
  { label: 'Total Users', value: '1,234', icon: Users, color: 'blue' },
  { label: 'Active Offices', value: '8', icon: Building2, color: 'green' },
  { label: 'Tickets Today', value: '456', icon: TrendingUp, color: 'purple' },
  { label: 'Avg Wait Time', value: '18 min', icon: Clock, color: 'orange' },
];

const recentActivity = [
  { office: 'Ministry of Health', tickets: 45, completed: 42, skipped: 3, avgWait: '15 min' },
  { office: 'Ministry of Education', tickets: 38, completed: 35, skipped: 3, avgWait: '12 min' },
  { office: 'Ministry of Transport', tickets: 52, completed: 48, skipped: 4, avgWait: '20 min' },
  { office: 'Ethiopian Revenue Authority', tickets: 67, completed: 61, skipped: 6, avgWait: '25 min' },
];

const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold text-black mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">System overview and analytics</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              hover
              className="text-center animate-slideInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center p-3 ${colorMap[stat.color as keyof typeof colorMap].bg} rounded-full mb-4`}>
                <stat.icon className={`h-6 w-6 ${colorMap[stat.color as keyof typeof colorMap].text}`} />
              </div>
              <p className="text-3xl font-bold text-black mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-black mb-4">Office Performance Today</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <Card
                key={index}
                className="animate-slideInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-800" />
                    <h3 className="font-semibold text-black">{activity.office}</h3>
                  </div>
                  <span className="text-sm text-gray-500">Avg Wait: {activity.avgWait}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-black">{activity.tickets}</p>
                    <p className="text-xs text-gray-600">Total Tickets</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">{activity.completed}</p>
                    </div>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <p className="text-2xl font-bold text-red-600">{activity.skipped}</p>
                    </div>
                    <p className="text-xs text-gray-600">Skipped</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>{Math.round((activity.completed / activity.tickets) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-800 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(activity.completed / activity.tickets) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
