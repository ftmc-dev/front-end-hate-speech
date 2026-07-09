import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router";

import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "@/routes/AppRoutes";
import { StrikersCountProvider } from "@/hooks/useStrikersCount";
import { client as SpeechClient } from "@/services/api/client.gen.ts";

const queryClient = new QueryClient();

export default function App() {
  SpeechClient.setConfig({
    baseURL: import.meta.env.VITE_REST_BASE_URL,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <StrikersCountProvider>
          <AppRoutes />
        </StrikersCountProvider>
      </AppErrorBoundary>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

function AppErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => setError(event.error ?? new Error(event.message));
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      setError(reason instanceof Error ? reason : new Error(String(reason)));
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  if (error) {
    return <ErrorFallback error={error} reset={() => setError(null)} />;
  }

  return <ReactErrorBoundary onError={setError}>{children}</ReactErrorBoundary>;
}

class ReactErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
    this.props.onError(error);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback error={this.state.error} reset={() => this.setState({ error: null })} />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-panel rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The dashboard didn't load. Try again below.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant"
          >
            Retry
          </button>
          <Link
            to="/"
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
