import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import History from "./pages/History";
import AuthPage from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AnimatedBackground from "./components/AnimatedBackground";
import { DataRefreshProvider } from "./contexts/DataRefreshContext";
import PersonalIntelligence from "./pages/PersonalIntelligence";
import PersonDetail from "./pages/PersonDetail";
import HistoryViewDetails from "./pages/HistoryViewDetails";
import TranscriptView from "./pages/TranscriptView";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/auth" replace />
      </SignedOut>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataRefreshProvider>
        <AnimatedBackground />
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/sign-in" element={<Navigate to="/auth" replace />} />
          <Route path="/sign-up" element={<Navigate to="/auth" replace />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            }
          />

          <Route
            path="/personal-intelligence"
            element={
              <ProtectedRoute>
                <PersonalIntelligence />
              </ProtectedRoute>
            }
          />

          <Route
            path="/person/:personId"
            element={
              <ProtectedRoute>
                <PersonDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history/:id"
            element={
              <ProtectedRoute>
                <HistoryViewDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history/:id/transcript"
            element={
              <ProtectedRoute>
                <TranscriptView />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </DataRefreshProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
