import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "~/components/header";

export default function AuthErrorPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const handleRetry = () => {
    // Redirect to the Akahu auth endpoint to try again
    window.location.href = "/api/auth/akahu";
  };

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
            onClick={handleRetry}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    </div>
  );
}
