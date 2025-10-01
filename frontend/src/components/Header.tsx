import { Download, Settings, User } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

const Header = ({ userName = "Aditya" }: HeaderProps) => {
  return (
    <header className="mb-8">
      <div className="flex items-start justify-between mb-8">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-medium text-foreground mb-1">maki.ai</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            className="w-10 h-10 glass-button glass-hover flex items-center justify-center"
            aria-label="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            className="w-10 h-10 glass-button glass-hover flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-4xl font-bold mb-2">Hey, {userName}!</h2>
        <p className="text-subtle text-lg">Here's what's important today</p>
      </div>
    </header>
  );
};

export default Header;
