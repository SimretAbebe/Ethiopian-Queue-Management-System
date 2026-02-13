import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Ticket, Clock, CheckCircle, Building2, Users, XCircle, History, FileText } from 'lucide-react';
import { useAuth } from '../../features/auth/auth.context';

interface Office {
  id: string;
  name: string;
  services: string[];
}

const ethiopianOffices: Office[] = [
  {
    id: 'moh',
    name: 'Ministry of Health',
    services: ['Medical Certificate', 'Health Clearance', 'License Renewal', 'Drug Registration'],
  },
  {
    id: 'moe',
    name: 'Ministry of Education',
    services: ['Document Verification', 'Certificate Authentication', 'Equivalence Assessment', 'Student Records'],
  },
  {
    id: 'mot',
    name: 'Ministry of Transport',
    services: ['Driving License', 'Vehicle Registration', 'Transport Permit', 'License Renewal'],
  },
  {
    id: 'moti',
    name: 'Ministry of Trade and Industry',
    services: ['Business License', 'Trade Registration', 'Import/Export Permit', 'Company Registration'],
  },
  {
    id: 'moa',
    name: 'Ministry of Agriculture',
    services: ['Land Registration', 'Agricultural Permit', 'Export Certificate', 'Livestock Registration'],
  },
  {
    id: 'erca',
    name: 'Ethiopian Revenue and Customs Authority',
    services: ['Tax Clearance', 'TIN Registration', 'Customs Declaration', 'Tax Filing'],
  },
  {
    id: 'eep',
    name: 'Ethiopian Electric Power',
    services: ['New Connection', 'Meter Reading', 'Bill Payment', 'Power Upgrade'],
  },
  {
    id: 'aaca',
    name: 'Addis Ababa City Administration',
    services: ['ID Card', 'Birth Certificate', 'Residence Permit', 'Building Permit'],
  },
];

interface UserTicket {
  id: string;
  number: string;
  office: string;
  service: string;
  position: number;
  estimatedWait: number;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  createdAt: Date;
}

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [otherServiceDescription, setOtherServiceDescription] = useState('');
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'mytickets'>('new');
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'serving' | 'completed' | 'cancelled'>('all');

  const selectedOffice = ethiopianOffices.find(o => o.id === selectedOfficeId);
  const isOtherSelected = selectedService === 'Other';

  const handleGetTicket = () => {
    if (!selectedOffice || !selectedService) {
      alert('Please select both office and service');
      return;
    }

    if (isOtherSelected && !otherServiceDescription.trim()) {
      alert('Please describe the service you need');
      return;
    }

    const serviceName = isOtherSelected ? `Other: ${otherServiceDescription}` : selectedService;
    const ticketNumber = `${selectedOffice.id.toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newTicket: UserTicket = {
      id: Date.now().toString(),
      number: ticketNumber,
      office: selectedOffice.name,
      service: serviceName,
      position: Math.floor(Math.random() * 15) + 1,
      estimatedWait: Math.floor(Math.random() * 45) + 15,
      status: 'waiting',
      createdAt: new Date(),
    };

    setTickets([newTicket, ...tickets]);
    setSelectedOfficeId(null);
    setSelectedService('');
    setOtherServiceDescription('');
    setActiveTab('mytickets');
  };

  const handleCancelTicket = (ticketId: string) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: 'cancelled' } : t
    ));
  };

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  const waitingCount = tickets.filter(t => t.status === 'waiting').length;
  const servingCount = tickets.filter(t => t.status === 'serving').length;
  const completedCount = tickets.filter(t => t.status === 'completed').length;

  const getStatusBadge = (status: UserTicket['status']) => {
    switch (status) {
      case 'waiting':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Waiting</span>;
      case 'serving':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Serving</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">Cancelled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome, {user?.username}
          </h1>
          <p className="text-gray-600">Get your queue ticket and track your position</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card hover className="text-center animate-slideInUp">
            <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-black mb-1">{waitingCount}</p>
            <p className="text-sm text-gray-600">Waiting</p>
          </Card>

          <Card hover className="text-center animate-slideInUp" style={{ animationDelay: '100ms' }}>
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <Users className="h-6 w-6 text-blue-800" />
            </div>
            <p className="text-3xl font-bold text-black mb-1">{servingCount}</p>
            <p className="text-sm text-gray-600">Being Served</p>
          </Card>

          <Card hover className="text-center animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-black mb-1">{completedCount}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'new'
                ? 'text-blue-800 border-b-2 border-blue-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Ticket className="h-4 w-4 inline mr-2" />
            Get New Ticket
          </button>
          <button
            onClick={() => setActiveTab('mytickets')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'mytickets'
                ? 'text-blue-800 border-b-2 border-blue-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="h-4 w-4 inline mr-2" />
            My Tickets ({tickets.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'new' ? (
          <div className="space-y-6 animate-slideInUp">
            {/* Step 1: Select Office */}
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Step 1: Select Government Office</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ethiopianOffices.map((office, index) => (
                  <div
                    key={office.id}
                    onClick={() => {
                      setSelectedOfficeId(office.id);
                      setSelectedService('');
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg animate-slideInUp ${
                      selectedOfficeId === office.id
                        ? 'border-blue-800 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-blue-800" />
                      </div>
                      <p className="text-sm font-medium text-black leading-tight">{office.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select Service */}
            {selectedOffice && (
              <Card className="animate-slideInUp">
                <h2 className="text-xl font-bold text-black mb-4">Step 2: Select Service</h2>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-blue-50 rounded-lg">
                  <Building2 className="w-10 h-10 text-blue-800" />
                  <div>
                    <p className="font-semibold text-black">{selectedOffice.name}</p>
                    <p className="text-sm text-gray-600">Selected Office</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selectedOffice.services.map((service) => (
                    <button
                      key={service}
                      onClick={() => {
                        setSelectedService(service);
                        setOtherServiceDescription('');
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                        selectedService === service
                          ? 'border-blue-800 bg-blue-50 text-blue-800'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <p className="font-medium text-sm">{service}</p>
                    </button>
                  ))}
                  {/* Other Option */}
                  <button
                    onClick={() => setSelectedService('Other')}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 col-span-2 ${
                      selectedService === 'Other'
                        ? 'border-blue-800 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <p className="font-medium text-sm">Other (Describe your service)</p>
                    </div>
                  </button>
                </div>

                {/* Other Service Description */}
                {isOtherSelected && (
                  <div className="mb-4 animate-slideInUp">
                    <label className="block text-sm font-medium text-black mb-2">
                      Describe the service you need
                    </label>
                    <textarea
                      value={otherServiceDescription}
                      onChange={(e) => setOtherServiceDescription(e.target.value)}
                      placeholder="Please describe what service you need help with..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {otherServiceDescription.length}/500 characters
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGetTicket}
                  disabled={!selectedService || (isOtherSelected && !otherServiceDescription.trim())}
                >
                  <Ticket className="h-5 w-5 mr-2" />
                  Get Ticket
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-slideInUp">
            {/* Filter Options */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'waiting', 'serving', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
              <Card className="text-center py-12">
                <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {tickets.length === 0 ? 'No tickets yet' : 'No tickets match filter'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {tickets.length === 0
                    ? 'Get your first queue ticket to see it here'
                    : 'Try selecting a different filter'}
                </p>
                {tickets.length === 0 && (
                  <Button onClick={() => setActiveTab('new')}>
                    Get Your First Ticket
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket, index) => (
                  <Card
                    key={ticket.id}
                    className={`animate-slideInUp ${
                      ticket.status === 'serving' ? 'border-2 border-blue-800' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-center min-w-[80px]">
                          <p className="text-xl font-bold text-blue-800">{ticket.number}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <p className="font-semibold text-black">{ticket.office}</p>
                          </div>
                          <p className="text-sm text-gray-600">{ticket.service}</p>
                          {ticket.status === 'waiting' && (
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Position: {ticket.position}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                ~{ticket.estimatedWait} min
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(ticket.status)}
                        {ticket.status === 'waiting' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
