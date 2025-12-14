import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/authService";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      loginUser(user); // store in context / localStorage

      // redirect based on role
      switch (user.role) {
        case "ADMIN":
          navigate("/admin-dashboard");
          break;
        case "MANAGER":
          navigate("/manager-dashboard");
          break;
        case "STAFF":
          navigate("/staff-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <form
        onSubmit={submit}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-pink-600">Sign In</h2>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
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
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-pink-700 text-white py-2 rounded-full font-bold hover:scale-105 transform transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
