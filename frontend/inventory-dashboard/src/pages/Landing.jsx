import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-500 text-white">
      <h1 className="text-5xl font-bold mb-6 text-center">
        Inventory Dashboard
      </h1>
      <p className="text-lg mb-8 text-center">
        Manage products, stock, and sales efficiently.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Register Super Admin
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 border border-white font-semibold rounded-lg hover:bg-white hover:text-purple-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
