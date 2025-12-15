// pages/TestLogin.tsx - Create this as a temporary test
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TestLogin: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<string>("");

  const testLogin = async () => {
    try {
      console.log("🚀 Starting login test...");
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "admin@example.com", // Use your actual admin email
          password: "password123"     // Use your actual admin password
        }),
      });

      const data = await response.json();
      
      console.log("📦 Full response:", data);
      
      if (response.ok && data.token) {
        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setResult(`✅ SUCCESS! Token: ${data.token.substring(0, 20)}... Role: ${data.user.role}`);
        
        // Try to redirect
        setTimeout(() => {
          console.log("🔄 Attempting redirect to admin-dashboard");
          navigate('/admin-dashboard');
        }, 1000);
      } else {
        setResult(`❌ FAILED: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      setResult(`❌ NETWORK ERROR: ${error.message}`);
    }
  };

  const testProtectedRoute = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setResult("❌ No token found in localStorage");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/test/protected', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setResult(`🔐 Protected route: ${response.status} - ${JSON.stringify(data)}`);
    } catch (error: any) {
      setResult(`❌ Protected route error: ${error.message}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setResult("🗑️ Storage cleared");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">🔧 Login Debug Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testLogin}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Test Login API
          </button>
          
          <button
            onClick={testProtectedRoute}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
          >
            Test Protected Route
          </button>
          
          <button
            onClick={clearStorage}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
          >
            Clear localStorage
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
          >
            Go to Real Login
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-bold mb-2">Result:</h2>
            <pre className="text-sm whitespace-pre-wrap break-all">{result}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-bold mb-2">📝 Check Console (F12)</h3>
          <p className="text-sm">Open DevTools Console to see detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;