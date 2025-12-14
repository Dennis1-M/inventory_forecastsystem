import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register-superuser"); // Navigate to registration page
  };

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/store.jpg')" }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-600/70 via-pink-500/50 to-pink-700/80"></div>

        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-6 h-6 bg-white rounded-full opacity-30 animate-bounce-slow"></div>
        <div className="absolute top-1/2 right-20 w-10 h-10 bg-white rounded-full opacity-20 animate-pulse-slow"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
            Welcome to Inventory Manager
          </h1>
          <p className="text-lg md:text-2xl text-pink-100 mb-10 drop-shadow-md">
            Manage your products, sales, and users with ease and efficiency.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white font-bold rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition transform duration-300"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section (optional scroll target) */}
      <section className="py-20 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-pink-50 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h2 className="text-xl font-bold mb-2">Product Management</h2>
            <p>Keep track of all your products, stock levels, and categories efficiently.</p>
          </div>
          <div className="p-6 bg-pink-50 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h2 className="text-xl font-bold mb-2">Sales Tracking</h2>
            <p>Monitor sales, revenue, and trends with detailed insights and reports.</p>
          </div>
          <div className="p-6 bg-pink-50 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h2 className="text-xl font-bold mb-2">User Management</h2>
            <p>Manage users, roles, and permissions for better team collaboration.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
