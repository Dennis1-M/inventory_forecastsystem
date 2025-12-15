// components/DebugPanel.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DebugPanel: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState<string>('Not tested');
  const [protectedStatus, setProtectedStatus] = useState<string>('Not tested');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log('📍 Current route:', location.pathname);
    console.log('🔐 Auth state:', { user, token });
  }, [location, user, token]);

  const testBackend = async (endpoint: string, setter: (status: string) => void) => {
    try {
      setter('Testing...');
      const startTime = Date.now();
      const response = await fetch(endpoint, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const endTime = Date.now();
      const data = await response.json();
      
      const status = `${response.status} - ${response.statusText}`;
      const time = `${endTime - startTime}ms`;
      
      console.log(`Test ${endpoint}:`, { status, time, data });
      setter(`✅ ${status} (${time})`);
      
      // Show alert with details
      setTimeout(() => {
        alert(`${endpoint}\nStatus: ${status}\nTime: ${time}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
      }, 100);
      
    } catch (error: any) {
      console.error(`Test ${endpoint} failed:`, error);
      setter(`❌ Error: ${error.message}`);
      alert(`Error testing ${endpoint}: ${error.message}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🗑️ All storage cleared');
    alert('LocalStorage and SessionStorage cleared. Page will reload.');
    window.location.reload();
  };

  const simulateLogin = (role: string) => {
    const testUser = {
      id: 999,
      name: `Test ${role}`,
      email: `test${role.toLowerCase()}@example.com`,
      role: role,
      isActive: true
    };
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5LCJyb2xlIjoi' + role + 'IiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', testToken);
    
    console.log(`🧪 Simulated login as ${role}`);
    alert(`Simulated login as ${role}. Page will reload.`);
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-black text-white p-2 rounded-full"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs z-50 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">🔍 Debug Panel</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {/* Current State */}
      <div className="mb-3 p-2 bg-gray-800 rounded">
        <p className="font-semibold">Current State:</p>
        <p>📍 Route: <span className="text-blue-300">{location.pathname}</span></p>
        <p>🔑 Token: <span className={token ? "text-green-300" : "text-red-300"}>
          {token ? `✅ (${token.substring(0, 15)}...)` : '❌ Missing'}
        </span></p>
        <p>👤 User: <span className={user ? "text-green-300" : "text-red-300"}>
          {user ? `✅ ${user.email} (${user.role})` : '❌ Missing'}
        </span></p>
      </div>
      
      {/* API Tests */}
      <div className="space-y-2 mb-3">
        <button 
          onClick={() => testBackend('/api/test/public', setApiStatus)}
          className="block w-full bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded text-left"
        >
          Test Public API
        </button>
        <div className="text-xs text-gray-300">Status: {apiStatus}</div>
        
        <button 
          onClick={() => testBackend('/api/test/protected', setProtectedStatus)}
          className="block w-full bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-left"
        >
          Test Protected API
        </button>
        <div className="text-xs text-gray-300">Status: {protectedStatus}</div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-1.5">
        <button 
          onClick={() => {
            console.log('localStorage:', {
              token: localStorage.getItem('token'),
              user: localStorage.getItem('user')
            });
            alert(`Token: ${localStorage.getItem('token')}\n\nUser: ${localStorage.getItem('user')}`);
          }}
          className="block w-full bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-left"
        >
          Show localStorage
        </button>
        
        <div className="grid grid-cols-2 gap-1">
          <button 
            onClick={() => simulateLogin('ADMIN')}
            className="bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded text-left"
          >
            Simulate Admin
          </button>
          <button 
            onClick={() => simulateLogin('MANAGER')}
            className="bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded text-left"
          >
            Simulate Manager
          </button>
          <button 
            onClick={() => simulateLogin('STAFF')}
            className="bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded text-left"
          >
            Simulate Staff
          </button>
          <button 
            onClick={clearStorage}
            className="bg-red-700 hover:bg-red-600 px-2 py-1 rounded text-left"
          >
            Clear Storage
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/login')}
          className="block w-full bg-yellow-700 hover:bg-yellow-600 px-3 py-1.5 rounded text-left"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;