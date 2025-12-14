import { useNavigate } from "react-router-dom";

const NotAuthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 px-4">
      <h1 className="text-6xl font-bold text-pink-700 mb-4">403</h1>
      <h2 className="text-3xl font-semibold text-pink-600 mb-6">
        Not Authorized
      </h2>
      <p className="text-lg text-pink-800 mb-8 text-center">
        You do not have permission to access this page.
      </p>
      <button
        className="px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition"
        onClick={() => navigate("/")}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotAuthorized;
