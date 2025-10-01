import { Home, Image, Users, Network, Clock } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { icon: Home, active: true },
    { icon: Image, active: false },
    { icon: Users, active: false },
    { icon: Network, active: false },
    { icon: Clock, active: false },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[170px] h-screen bg-card/30 backdrop-blur-xl border-r border-border flex-col items-center py-6 px-4 fixed left-0 top-0">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">maki.ai</h1>
        </div>

        {/* User Avatar & Greeting */}
        <div className="w-full mb-8">
          <div className="w-14 h-14 rounded-full border-2 border-border bg-card/50 flex items-center justify-center mb-3 mx-auto">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-4 w-full">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all mx-auto ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card/40 text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/40 backdrop-blur-xl border-t border-border z-50">
        <div className="flex justify-around items-center py-3 px-4">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-card/40 text-muted-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
