import { useNavigate } from "react-router";

interface ErrorPageProps {
  error?: Error;
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold  mb-2">Oops!</h1>
          <p className="text-xl text-gray-600">
            {error?.message || "Sorry, something went wrong"}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-500">
            Don't worry, it happens to the best of us. Let's get you back on track.
          </p>
          
          <button
            onClick={() => navigate("/")}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
