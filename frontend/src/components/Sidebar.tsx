import { Home, Calendar, Users, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem?: string;
}

const Sidebar = ({ activeItem = "home" }: SidebarProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "users", icon: Users, label: "Users" },
    { id: "network", icon: Network, label: "Network" },
  ];

  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-screen w-20  flex flex-col items-center py-8 z-50">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full glow-text" />
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;
          
          return (
            <button
              key={item.id}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                "hover:bg-white/5",
                isActive && "bg-primary shadow-[0_0_20px_hsl(188_95%_50%/0.3)]"
              )}
              aria-label={item.label}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-primary-foreground" : "text-foreground/70"
                )} 
              />
            </button>
          );
        })}
      </nav>

      {/* History/Clock Icon */}
      <button 
        className="w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all duration-300"
        aria-label="History"
      >
        <svg className="w-6 h-6 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;
