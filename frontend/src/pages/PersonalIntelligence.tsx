// frontend/src/pages/PersonalIntelligence.tsx
import { useState } from "react";
import { Download, Settings, Search } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import Sidebar from "@/components/Sidebar";

interface FollowUp {
  id: string;
  name: string;
  role: string;
  priority: "high" | "medium" | "low";
  description: string;
}

interface Contact {
  initials: string;
  name: string;
}

interface Interaction {
  name: string;
  description: string;
  time: string;
}

const PersonalIntelligence = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const pendingFollowUps: FollowUp[] = [
    {
      id: "1",
      name: "Mark",
      role: "Sales Lead",
      priority: "high",
      description: "Quarterly Sales Report",
    },
    {
      id: "2",
      name: "James",
      role: "C.A.",
      priority: "medium",
      description: "Yearly Tax Report",
    },
    {
      id: "3",
      name: "Jenny",
      role: "Wife",
      priority: "low",
      description: "Holiday Booking",
    },
  ];

  const latestInteractions: Interaction[] = [
    {
      name: "Dev Nandan Anoop",
      description: "Startup Discussion",
      time: "9 P.M.",
    },
    {
      name: "Alex Costa",
      description: "Product Discussion",
      time: "5 P.M.",
    },
    {
      name: "Jack Reacher",
      description: "Appraisal Meeting",
      time: "3.30 P.M.",
    },
    {
      name: "Alice",
      description: "Requested new toy",
      time: "2 P.M.",
    },
  ];

  const getPriorityConfig = (priority: "high" | "medium" | "low") => {
    const configs = {
      high: {
        bgColor: "bg-red-600",
        label: "High Priority",
      },
      medium: {
        bgColor: "bg-orange-500",
        label: "Medium Priority",
      },
      low: {
        bgColor: "bg-green-600",
        label: "Low Priority",
      },
    };
    return configs[priority];
  };

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-foreground tracking-wide" 
                style={{ fontFamily: "'Courier New', 'Courier', monospace" }}>
              maki.ai
            </h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="ml-5">
                <h2 className="text-2xl font-semibold text-foreground">Personal Intelligence</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Understanding people, made easier.</p>
              </div>
            </div>
            <div className="flex gap-2 absolute right-4 top-4">
              <button className="w-7 h-7 p-2 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center">
                <Download className="w-4 h-4 text-foreground" />
              </button>
              <button className="w-7 h-7 p-2 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center">
                <Settings className="w-4 h-4 text-foreground" />
              </button>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <div className="mb-6 absolute top-6 left-8">
            <h1 className="text-xl font-semibold text-foreground fixed tracking-wide" 
                style={{ fontFamily: "'Courier New', 'Courier', monospace" }}>
              maki.ai
            </h1>
          </div>
          
          <div className="absolute right-36 top-6 z-10">
            <div className="fixed flex gap-3">
              <button className="w-8 h-8 p-2 rounded-full bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/60 transition-all">
                <Download className="w-5 h-5 text-foreground" />
              </button>
              <button className="w-8 h-8 p-2 rounded-full bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/60 transition-all">
                <Settings className="w-5 h-5 text-foreground" />
              </button>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
          
          <div className="pt-12">
            <div>
              <h2 className="text-4xl font-semibold text-foreground">Personal Intelligence</h2>
              <p className="text-base text-muted-foreground mt-1 opacity-60">Understanding people, made easier.</p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto">
          {/* Search Bar */}
          <div className="mb-5">
            <div className="glass-container rounded-full p-1">
              <div className="flex items-center gap-3 px-6 py-2.5">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search for a name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  aria-label="Search for a name"
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Pending Follow Ups Section */}
            <section 
              className="glass-container rounded-3xl p-6 lg:p-7"
              aria-labelledby="pending-follow-ups-title"
              style={{ height: '340px' }}
            >
              <h3 
                id="pending-follow-ups-title"
                className="text-xl lg:text-2xl font-medium text-foreground mb-5 pb-5 border-b border-border/30"
              >
                Pending Follow Ups
              </h3>
              
              <ul className="space-y-5">
                {pendingFollowUps.map((followUp) => {
                  const priorityConfig = getPriorityConfig(followUp.priority);
                  return (
                    <li key={followUp.id} className="space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <span className="text-base lg:text-lg text-foreground">
                          {followUp.name} <span className="text-muted-foreground text-sm">({followUp.role})</span>
                        </span>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold text-white ${priorityConfig.bgColor}`}
                          aria-label={`Priority: ${priorityConfig.label}`}
                        >
                          {priorityConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {followUp.description}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Suggested Follow Ups Section */}
            <section 
              className="glass-container rounded-3xl p-6 lg:p-7"
              aria-labelledby="suggested-follow-ups-heading"
              style={{ height: '340px' }}
            >
              <h3 
                id="suggested-follow-ups-heading"
                className="text-xl lg:text-2xl font-medium text-foreground mb-5 pb-5 border-b border-border/30"
              >
                Suggested Follow Ups
              </h3>
              
              <div className="flex justify-center items-center h-[230px]">
                <div className="relative w-[240px] h-[240px]">
                  {/* Center - Mom */}
                  <button
                    className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/20 transition-all duration-200 z-10"
                    aria-label="Follow up with Mom"
                  >
                    <span className="text-base font-semibold text-foreground opacity-80 group-hover:opacity-100">
                      M
                    </span>
                    <span className="text-[9px] text-muted-foreground opacity-60 group-hover:opacity-80 mt-0.5">
                      Mom
                    </span>
                  </button>

                  {/* Surrounding contacts in circular pattern */}
                  {[
                    { contact: { initials: "NVP", name: "Naveen" }, angle: 0 },
                    { contact: { initials: "TD", name: "Tyler" }, angle: 60 },
                    { contact: { initials: "D", name: "Dad" }, angle: 120 },
                    { contact: { initials: "PB", name: "Patrick" }, angle: 180 },
                    { contact: { initials: "WW", name: "Walter" }, angle: 240 },
                    { contact: { initials: "YK", name: "Yash" }, angle: 300 },
                  ].map(({ contact, angle }, index) => {
                    const radius = 90;
                    const angleRad = (angle * Math.PI) / 180;
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    
                    return (
                      <button
                        key={`${contact.initials}-${index}`}
                        className="group absolute flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/20 transition-all duration-200"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        aria-label={`Follow up with ${contact.name}`}
                      >
                        <span className="text-sm font-semibold text-foreground opacity-80 group-hover:opacity-100">
                          {contact.initials}
                        </span>
                        <span className="text-[8px] text-muted-foreground opacity-60 group-hover:opacity-80 mt-0.5">
                          {contact.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Latest Interactions Section */}
          <section 
            className="glass-container rounded-3xl p-5 lg:p-6"
            aria-labelledby="latest-interactions-heading"
          >
            <h3 
              id="latest-interactions-heading"
              className="text-xl lg:text-2xl font-medium text-foreground mb-5 pb-5 border-b border-border/30"
            >
              Latest Interactions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestInteractions.map((interaction, index) => (
                <article 
                  key={index}
                  className="bg-primary/20 rounded-xl p-3.5 hover:bg-primary/30 transition-colors cursor-pointer border border-primary/30"
                >
                  <h4 className="text-sm lg:text-base font-semibold text-foreground mb-1 opacity-90">
                    {interaction.name}
                  </h4>
                  <p className="text-xs text-muted-foreground opacity-70 mb-1.5">
                    {interaction.description}
                  </p>
                  <time className="text-xs text-muted-foreground opacity-60">
                    {interaction.time}
                  </time>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PersonalIntelligence;