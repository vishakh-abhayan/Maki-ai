// frontend/src/components/Sidebar.tsx
import { Home, Users, Network, History, CalendarCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: "/", active: location.pathname === "/" },
    { icon: CalendarCheck, path: "/activities", active: location.pathname === "/activities" },
    { icon: Users, path: "/personal-intelligence", active: location.pathname === "/personal-intelligence" },
    { icon: Network, path: "/network", active: false },
  ];

  return (
    <div>
      {/* Desktop Sidebar - Fixed Position */}
      <aside className="hidden lg:flex lg:fixed lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:z-40 glass-container rounded-bl-none rounded-tl-none py-1 lg:h-[calc(100vh-14rem)] w-[90px] flex-col items-center">
        
        {/* Navigation Icons */}
        <nav className="flex glass-card flex-col gap-8 pt-8 w-full flex-1 p-4 rounded-bl-none rounded-tl-none">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all mx-auto ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <item.icon strokeWidth={1.5} className="w-7 h-7" />
            </button>
          ))}
          
          {/* Spacer to push last button to bottom */}
          <div className="flex-1" />
          
          {/* Bottom Button - History */}
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all mx-auto hover:bg-card/60 hover:text-foreground"
            onClick={() => navigate("/history")}
          >
            <History  strokeWidth={1.5} className="w-7 h-7" />
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden glass-container p-2 fixed bottom-0 left-0 right-0 bg-card/40 border-border z-50">
        <div className="flex glass-card justify-around items-center py-3 px-4">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : ""
              }`}
            >
              <item.icon strokeWidth={1.5} className="w-4 h-4" />
            </button>
          ))}
          
          {/* Add History button to mobile nav */}
          <button
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
          >
            <History path="/history" strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;