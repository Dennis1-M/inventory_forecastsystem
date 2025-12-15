import { useEffect, useState } from "react"; // Add useEffect
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Add debug state
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    addDebug("🔧 Login component mounted");
    addDebug(`🌐 Backend URL: http://localhost:5001/api/auth/login`);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    addDebug("🔄 Submit button clicked");
    setLoading(true);
    setError("");
    setDebugInfo([]); // Clear previous debug

    try {
      addDebug(`📤 Sending login request for: ${email}`);
      
      const API_URL = "http://localhost:5001/api/auth/login";
      addDebug(`🌐 API Endpoint: ${API_URL}`);
      
      const startTime = Date.now();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const endTime = Date.now();
      addDebug(`⏱️ Response received in ${endTime - startTime}ms`);
      addDebug(`📊 Status: ${response.status} ${response.statusText}`);

      // Log response headers for CORS check
      const corsHeader = response.headers.get('access-control-allow-origin');
      addDebug(`🌍 CORS Header: ${corsHeader || 'Not set'}`);

      // Check if response is empty
      const responseText = await response.text();
      addDebug(`📄 Response length: ${responseText.length} characters`);
      
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        addDebug("✅ JSON parsed successfully");
      } catch (parseError) {
        addDebug(`❌ JSON parse failed. Response: ${responseText.substring(0, 200)}`);
        throw new Error(`Invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      addDebug(`📦 Response data keys: ${Object.keys(data).join(', ')}`);

      if (!response.ok) {
        addDebug(`❌ Server error: ${data.message || 'Unknown error'}`);
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (!data.token) {
        addDebug("❌ No token in response");
        throw new Error('No authentication token received');
      }

      if (!data.user) {
        addDebug("❌ No user data in response");
        throw new Error('No user data received');
      }

      addDebug(`✅ Login successful! Token: ${data.token.substring(0, 20)}..., Role: ${data.user.role}`);

      // Step 1: Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      addDebug("💾 Saved to localStorage");

      // Step 2: Update context
      loginUser(data.user, data.token);
      addDebug("🔄 Updated AuthContext");

      // Step 3: Verify storage
      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        addDebug(`🔍 Verification - Token in localStorage: ${storedToken ? '✅' : '❌'}`);
        addDebug(`🔍 Verification - User in localStorage: ${storedUser ? '✅' : '❌'}`);
        
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            addDebug(`👤 Stored user: ${parsed.email} (${parsed.role})`);
          } catch (e) {
            addDebug("❌ Failed to parse stored user");
          }
        }
      }, 50);

      // Step 4: Redirect
      addDebug(`📍 Preparing redirect to ${data.user.role.toLowerCase()}-dashboard`);
      
      setTimeout(() => {
        const targetPath = `/${data.user.role.toLowerCase()}-dashboard`;
        addDebug(`🚀 Redirecting to: ${targetPath}`);
        window.location.href = targetPath; // Use window.location for full reload
      }, 100);

    } catch (err: any) {
      addDebug(`❌ ERROR: ${err.message}`);
      console.error("Login error details:", err);
      setError(err.message || "Login failed. Please check backend connection.");
    } finally {
      setLoading(false);
      addDebug("🏁 Submit function completed");
    }
  };

  const testConnection = async () => {
    addDebug("🧪 Testing backend connection...");
    
    try {
      const response = await fetch('http://localhost:5001/');
      const text = await response.text();
      addDebug(`🔌 Backend root: ${response.status} - "${text}"`);
      
      if (response.ok) {
        addDebug("✅ Backend is running!");
      }
    } catch (error: any) {
      addDebug(`❌ Backend not reachable: ${error.message}`);
      setError("Backend server not running on port 5001");
    }
  };

  const testAPIPublic = async () => {
    addDebug("🧪 Testing public API...");
    
    try {
      const response = await fetch('http://localhost:5001/api/test/public');
      const data = await response.json();
      addDebug(`📡 Public API: ${response.status} - ${JSON.stringify(data)}`);
    } catch (error: any) {
      addDebug(`❌ Public API failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* Login Form */}
        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/2 space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-pink-600">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
              disabled={loading}
              placeholder="admin@example.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          {/* The button in question */}
          <div className="relative">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-pink-500 to-pink-700 text-white py-3 rounded-full font-bold hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <span className={`${loading ? 'opacity-0' : 'opacity-100'}`}>
                Login
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Logging in...</span>
                </div>
              )}
            </button>
            
            {/* Button debug info */}
            <div className="mt-2 text-xs text-gray-500">
              <p>Button state: {loading ? "⏳ Loading..." : "✅ Ready"}</p>
              <p>Disabled: {loading ? "Yes" : "No"}</p>
              <p>Clickable: {loading ? "No" : "Yes"}</p>
            </div>
          </div>

          {/* Test buttons */}
          <div className="space-y-3 pt-4 border-t">
            <button
              type="button"
              onClick={testConnection}
              className="w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200"
            >
              🔌 Test Backend Connection
            </button>
            
            <button
              type="button"
              onClick={testAPIPublic}
              className="w-full bg-green-100 text-green-700 py-2 rounded hover:bg-green-200"
            >
              📡 Test Public API
            </button>
            
            <button
              type="button"
              onClick={() => {
                // Test credentials
                setEmail("admin@example.com");
                setPassword("password123");
                addDebug("🧪 Auto-filled test credentials");
              }}
              className="w-full bg-purple-100 text-purple-700 py-2 rounded hover:bg-purple-200"
            >
              🧪 Auto-fill Test Credentials
            </button>
          </div>
        </form>

        {/* Debug Panel */}
        <div className="bg-gray-900 text-gray-100 p-6 rounded-xl shadow-lg w-full md:w-1/2 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">🔧 Debug Console</h3>
            <button
              onClick={() => setDebugInfo([])}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>
          
          <div className="h-96 overflow-y-auto font-mono text-sm space-y-1">
            {debugInfo.length === 0 ? (
              <p className="text-gray-400 italic">Click login to see debug info...</p>
            ) : (
              debugInfo.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${msg.includes('❌') ? 'bg-red-900/30' : msg.includes('✅') ? 'bg-green-900/30' : 'bg-gray-800/30'}`}
                >
                  {msg}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="font-bold mb-2">📝 Quick Checks:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800 p-2 rounded">
                <p>Backend: <span className="text-yellow-300">localhost:5001</span></p>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <p>Frontend: <span className="text-yellow-300">localhost:5173</span></p>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <p>localStorage: <span className="text-yellow-300">
                  {localStorage.getItem('token') ? 'Has token' : 'No token'}
                </span></p>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <p>Current Path: <span className="text-yellow-300">{window.location.pathname}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;