import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../features/auth/auth.context';

interface QueueTicket {
  id: string;
  number: string;
  citizen: string;
  service: string;
  waitTime: number;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
}

const mockQueue: QueueTicket[] = [
  { id: '1', number: 'MIN-001', citizen: 'Abebe Kebede', service: 'Document Verification', waitTime: 5, status: 'waiting' },
  { id: '2', number: 'MIN-002', citizen: 'Tigist Haile', service: 'License Application', waitTime: 10, status: 'waiting' },
  { id: '3', number: 'MIN-003', citizen: 'Dawit Mengistu', service: 'Certificate Request', waitTime: 15, status: 'waiting' },
  { id: '4', number: 'MIN-004', citizen: 'Sara Tesfaye', service: 'Permit Processing', waitTime: 20, status: 'waiting' },
];

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueTicket[]>(mockQueue);
  const [currentTicket, setCurrentTicket] = useState<QueueTicket | null>(null);

  const handleCallNext = () => {
    const nextTicket = queue.find(t => t.status === 'waiting');
    if (nextTicket) {
      setCurrentTicket(nextTicket);
      setQueue(queue.map(t =>
        t.id === nextTicket.id ? { ...t, status: 'serving' } : t
      ));
    }
  };

  const handleComplete = () => {
    if (currentTicket) {
      setQueue(queue.map(t =>
        t.id === currentTicket.id ? { ...t, status: 'completed' } : t
      ));
      setCurrentTicket(null);
    }
  };

  const handleSkip = () => {
    if (currentTicket) {
      setQueue(queue.map(t =>
        t.id === currentTicket.id ? { ...t, status: 'skipped' } : t
      ));
      setCurrentTicket(null);
    }
  };

  const waitingCount = queue.filter(t => t.status === 'waiting').length;
  const servingCount = queue.filter(t => t.status === 'serving').length;
  const completedCount = queue.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold text-black mb-2">
            Officer Dashboard
          </h1>
          <p className="text-gray-600">Manage queue and serve citizens</p>
        </div>

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
            <p className="text-sm text-gray-600">Serving</p>
          </Card>

          <Card hover className="text-center animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-black mb-1">{completedCount}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>
        </div>

        {currentTicket && (
          <Card className="bg-gradient-to-r from-blue-800 to-blue-900 text-white animate-scaleIn">
            <h2 className="text-2xl font-bold mb-6">Currently Serving</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-blue-100 text-sm mb-1">Ticket Number</p>
                <p className="text-3xl font-bold">{currentTicket.number}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Citizen Name</p>
                <p className="text-2xl font-semibold">{currentTicket.citizen}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-blue-100 text-sm mb-1">Service</p>
                <p className="text-xl font-medium">{currentTicket.service}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleComplete}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white text-white hover:bg-white hover:text-blue-800"
                onClick={handleSkip}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Skip
              </Button>
            </div>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">Queue</h2>
          <Button onClick={handleCallNext} disabled={!waitingCount}>
            <Phone className="h-4 w-4 mr-2" />
            Call Next
          </Button>
        </div>

        <div className="space-y-3">
          {queue.map((ticket, index) => (
            <Card
              key={ticket.id}
              className={`animate-slideInUp ${
                ticket.status === 'serving' ? 'border-2 border-blue-800' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">{ticket.number}</p>
                    <p className="text-xs text-gray-500">{ticket.waitTime} min</p>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{ticket.citizen}</p>
                    <p className="text-sm text-gray-600">{ticket.service}</p>
                  </div>
                </div>
                <div>
                  {ticket.status === 'waiting' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      Waiting
                    </span>
                  )}
                  {ticket.status === 'serving' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Serving
                    </span>
                  )}
                  {ticket.status === 'completed' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Completed
                    </span>
                  )}
                  {ticket.status === 'skipped' && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      Skipped
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
