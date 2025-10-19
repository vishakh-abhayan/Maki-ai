import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import "./clerk-custom.css";
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>  
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/sign-in"
       appearance={{
        baseTheme: dark, // Use Clerk's dark theme as base
        variables: {
          // Glassmorphic color overrides
          colorPrimary: '#60a5fa', // Blue-400
          colorBackground: 'rgba(255, 255, 255, 0.1)', // Semi-transparent
          colorInputBackground: 'rgba(255, 255, 255, 0.08)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '1rem',
          colorDanger: '#ef4444',
        },
        elements: {
          // Main card/modal styling
          card: 'glassmorphic-card',
          rootBox: 'glassmorphic-root',
          
          // Modal backdrop
          modalBackdrop: 'glassmorphic-backdrop',
          
          // UserProfile specific
          userProfile: 'glassmorphic-profile',
          profileSection: 'glassmorphic-section',
          
          // Buttons
          formButtonPrimary: 'glassmorphic-button-primary',
          
          // Remove or hide unwanted elements
          footer: 'hidden', // Hide "Secured by Clerk"
          badge: 'hidden', // Hide "Development mode"
        },
      }}
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>
);