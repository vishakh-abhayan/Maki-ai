import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import "./clerk-custom.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>  
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/sign-in"
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>
);