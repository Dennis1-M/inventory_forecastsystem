
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';
import { api } from '../../lib/api';

const fetchHealthStatus = async () => {
  const { data } = await api.get('/health-status');
  return data;
};

const StatusCard = ({ title, status, icon }: { title: string; status: string; icon: React.ReactNode }) => {
  const isOk = status === 'OK';
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 flex items-center ${isOk ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
      <div className="mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className={`text-2xl font-bold ${isOk ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      </div>
    </div>
  );
};


const SystemHealthPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div>Loading system health status...</div>;
  }

  if (isError) {
    return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>Could not fetch system health status. The backend may be down.</p>
            <p className="text-sm mt-2">Details: {error.message}</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">System Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusCard 
          title="API Status" 
          status={data.apiStatus} 
          icon={data.apiStatus === 'OK' ? <CheckCircle size={40} className="text-green-500" /> : <AlertCircle size={40} className="text-red-500" />}
        />
        <StatusCard 
          title="Database Connectivity" 
          status={data.dbStatus} 
          icon={data.dbStatus === 'OK' ? <Database size={40} className="text-green-500" /> : <Database size={40} className="text-red-500" />}
        />
      </div>
      <div className="mt-6 text-sm text-gray-500">
        Last checked: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default SystemHealthPage;