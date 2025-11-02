// frontend/src/components/Sidebar.tsx
import { Home, Users, History, CalendarCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useHistoryNotification } from "@/contexts/HistoryNotificationContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasNewConversations, unreadCount } = useHistoryNotification();

  const navItems = [
    { icon: Home, path: "/", active: location.pathname === "/" },
    { icon: CalendarCheck, path: "/activities", active: location.pathname === "/activities" },
    { icon: Users, path: "/personal-intelligence", active: location.pathname === "/personal-intelligence" },
    { icon: History, path: "/history", active: location.pathname === "/history", hasNotification: hasNewConversations, notificationCount: unreadCount },
  ];

  // Enhanced UserButton appearance
  const userButtonAppearance = {
    baseTheme: dark,
    elements: {
      // Avatar
      userButtonAvatarBox: "w-10 h-10 lg:w-10 lg:h-10 ",
      
      // Popover Card - Main dropdown container
      userButtonPopoverCard: "glassmorphic-popover",
      userButtonPopoverMain: "glassmorphic-popover-content",
      
      // User info in popover
      userPreviewMainIdentifier: "text-white font-semibold",
      userPreviewSecondaryIdentifier: "text-white/70 text-sm",
      
      // Action buttons (Manage account, Sign out)
      userButtonPopoverActionButton: "glassmorphic-action-btn",
      userButtonPopoverActionButtonText: "text-white",
      userButtonPopoverActionButtonIcon: "text-white/80",
      
      // Footer
      userButtonPopoverFooter: "hidden", // Hide "Secured by Clerk"
      
      // Badge
      badge: "hidden", // Hide "Development mode"
    },
    variables: {
      colorPrimary: '#60a5fa',
      colorBackground: 'rgba(255, 255, 255, 0.1)',
      colorText: '#ffffff',
      borderRadius: '1rem',
    },
  };

  return (
    <div>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:z-40 glass-container rounded-bl-none rounded-tl-none py-1 lg:h-[calc(100vh-14rem)] w-[90px] flex-col items-center">
        
        <nav className="flex flex-col gap-8 pt-8 w-full flex-1 p-4 rounded-bl-none rounded-tl-none">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all mx-auto ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <item.icon strokeWidth={1.5} className="w-7 h-7" />
              {item.hasNotification && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg border-2 border-card">
                  {item.notificationCount && item.notificationCount > 9 ? '9+' : item.notificationCount || ''}
                </span>
              )}
            </button>
          ))}
          
          <div className="flex-1" />
          
          {/* User Button */}
          <div className="flex items-center justify-center mx-auto">
            <SignedIn>
              <UserButton 
                appearance={userButtonAppearance}
              />
            </SignedIn>
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden glass-container p-2 fixed bottom-0 left-0 right-0 bg-card/40 border-border z-50">
        <div className="flex glass-card justify-around items-center py-3 px-4">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : ""
              }`}
            >
              <item.icon strokeWidth={1.5} className="w-4 h-4" />
              {item.hasNotification && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-lg border-2 border-card">
                  {item.notificationCount && item.notificationCount > 9 ? '9+' : item.notificationCount || ''}
                </span>
              )}
            </button>
          ))}
          
          <div className="flex items-center justify-center">
            <SignedIn>
              <UserButton appearance={userButtonAppearance} />
            </SignedIn>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;