import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth"; 
import NotFound from "./pages/NotFound";
import AnimatedBackground from "./components/AnimatedBackground";

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
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;