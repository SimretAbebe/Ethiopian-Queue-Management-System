import { Building2, Users, Clock, TrendingUp, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth/auth.context';

interface Office {
  name: string;
  logo: string;
}

const ethiopianOffices: Office[] = [
  {
    name: 'Ministry of Health',
    logo: 'https://www.moh.gov.et/sites/default/files/2025-12/MOH.png',
  },
  {
    name: 'Ministry of Education',
    logo: 'https://study.moe.gov.et/pluginfile.php/1/theme_academi/logo/1769768609/moe%20logo.png',
  },
  {
    name: 'Ministry of Transport',
    logo: 'https://egm.motl.gov.et/assets/img/logo.png',
  },
  {
    name: 'Ministry of Trade and Industry',
    logo: 'https://www.ecc.gov.et/assets/tradem.jpg',
  },
  {
    name: 'Ministry of Agriculture',
    logo: 'https://www.moa.gov.et/wp-content/uploads/2024/05/8be092791e5a37a2768386d522ddb7d03d315b79.png',
  },
  {
    name: 'Ethiopian Revenue and Customs Authority',
    logo: 'https://newbusinessethiopia.com/wp-content/uploads/2021/06/A-Revenue-Revenue.jpg',
  },
  {
    name: 'Ethiopian Electric Power',
    logo: 'https://www.ena.et/documents/42142/0/2020_10_5555555555555555555555555_png.png/22f417b4-f7ba-dce6-bbe7-707a2ad99148?version=1.0&t=1674399717595&download=true',
  },
  {
    name: 'Addis Ababa City Administration',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Addis_Ababa_City_Mayor_Office_Flag_%28FDRE%29.png',
  },
];

const features = [
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Track your queue position and estimated wait time in real-time',
  },
  {
    icon: Users,
    title: 'Multi-Role Support',
    description: 'Dedicated interfaces for citizens, officers, and administrators',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Built with security best practices and reliable infrastructure',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights and reports for service optimization',
  },
];

const stats = [
  { label: 'Government Offices', value: '50+' },
  { label: 'Daily Visitors', value: '10,000+' },
  { label: 'Average Wait Time Reduced', value: '45%' },
  { label: 'User Satisfaction', value: '96%' },
];

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 animate-scaleIn">
            <Building2 className="h-12 w-12 text-blue-800" />
          </div>
          <h1 className="text-5xl font-bold text-black leading-tight">
            Ethiopian Citizens Service<br />Queue Management System
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Modernizing government service delivery across Ethiopia with efficient queue management and real-time tracking
          </p>
          <div className="flex justify-center gap-4 pt-4">
            {!isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  onClick={() => (window.location.href = '/register')}
                  className="shadow-lg"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => (window.location.href = '/login')}
                >
                  Login
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={() => (window.location.href = '/dashboard')}
                className="shadow-lg"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center animate-slideInUp" style={{ animationDelay: `${index * 100}ms` }}>
              <p className="text-3xl font-bold text-blue-800">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </Card>
          ))}
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-3">Key Features</h2>
            <p className="text-gray-600">Everything you need for efficient queue management</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                hover
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-blue-800" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-3">Supported Government Offices</h2>
            <p className="text-gray-600">Serving major Ethiopian government institutions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ethiopianOffices.map((office, index) => (
              <Card
                key={index}
                hover
                className="flex flex-col items-center text-center p-6 animate-slideInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-20 h-20 mb-4 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                  <img
                    src={office.logo}
                    alt={office.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231e40af"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>';
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-black leading-tight">{office.name}</span>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-blue-800 text-white rounded-2xl p-12 text-center space-y-6 animate-scaleIn">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of Ethiopians experiencing faster, more efficient government services
          </p>
          {!isAuthenticated && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => (window.location.href = '/register')}
              className="shadow-xl"
            >
              Create Free Account
            </Button>
          )}
        </section>
      </div>
    </div>
  );
};
