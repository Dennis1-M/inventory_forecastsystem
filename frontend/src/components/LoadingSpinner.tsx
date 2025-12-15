// src/components/LoadingSpinner.tsx
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Checking system configuration...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;