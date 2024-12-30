import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Header } from "~/components/header";

export default function AkahuAuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!error) {
      // If no error, redirect to results
      navigate("/results");
    } else {
      setIsProcessing(false);
    }
  }, [error, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error === "access_denied") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-card rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
            <p className="text-muted-foreground mb-4">
              {errorDescription || "There was a problem authenticating with Akahu"}
            </p>
            <button
              onClick={() => window.location.href = "/account"}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
