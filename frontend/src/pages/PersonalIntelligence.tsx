import { useState, useEffect } from "react";
import { Download, Settings, Search, Phone } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { createAPIService, FollowUp, IntelligenceDashboard } from "@/services/api";
import { useAuth } from "@clerk/clerk-react";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { useToast } from "@/hooks/use-toast";

const PersonalIntelligence = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<IntelligenceDashboard | null>(null);

  const apiService = createAPIService(getToken);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIntelligenceDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load intelligence dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonClick = (personId: string) => {
    navigate(`/person/${personId}`);
  };

  const handleCallPerson = async (personId: string, personName: string) => {
    try {
      await apiService.initiateContact(personId, 'call');
      toast({
        title: "Call Initiated",
        description: `Calling ${personName}...`,
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await apiService.searchPeople(searchQuery);
      if (results.length > 0) {
        navigate(`/person/${results[0]._id}`);
      } else {
        toast({
          title: "No results",
          description: `No person found with name "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">Loading intelligence dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const pendingFollowUps = dashboardData?.pendingFollowUps || [];
  const suggestedFollowUps = dashboardData?.suggestedFollowUps || [];
  const latestInteractions = dashboardData?.latestInteractions || [];

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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
              
              {pendingFollowUps.length === 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-sm text-muted-foreground">No pending follow-ups</p>
                </div>
              ) : (
                <ul className="space-y-5 overflow-y-auto max-h-[220px]">
                  {pendingFollowUps.map((followUp) => {
                    const priorityConfig = getPriorityConfig(followUp.priority);
                    return (
                      <li 
                        key={followUp._id} 
                        className="space-y-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePersonClick(followUp.personId._id)}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <span className="text-base lg:text-lg text-foreground">
                            {followUp.personId.name}{' '}
                            <span className="text-muted-foreground text-sm">
                              ({followUp.personId.relationship?.type || 'Contact'})
                            </span>
                          </span>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold text-white ${priorityConfig.bgColor}`}
                            aria-label={`Priority: ${priorityConfig.label}`}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {followUp.context}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                {suggestedFollowUps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No suggestions available</p>
                ) : (
                  <div className="relative w-[240px] h-[240px]">
                    {/* Center Person */}
                    {suggestedFollowUps[0] && (
                      <button
                        onClick={() => handlePersonClick(suggestedFollowUps[0].personId)}
                        className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/20 transition-all duration-200 z-10"
                        aria-label={`Follow up with ${suggestedFollowUps[0].person}`}
                      >
                        <span className="text-base font-semibold text-foreground opacity-80 group-hover:opacity-100">
                          {suggestedFollowUps[0].person?.charAt(0) || 'U'}
                        </span>
                        <span className="text-[9px] text-muted-foreground opacity-60 group-hover:opacity-80 mt-0.5">
                          {suggestedFollowUps[0].person?.split(' ')[0] || 'User'}
                        </span>
                      </button>
                    )}

                    {/* Surrounding contacts in circular pattern */}
                    {suggestedFollowUps.slice(1, 7).map((followUp, index) => {
                      const angle = index * 60;
                      const radius = 90;
                      const angleRad = (angle * Math.PI) / 180;
                      const x = Math.cos(angleRad) * radius;
                      const y = Math.sin(angleRad) * radius;
                      
                      return (
                        <button
                          key={`${followUp.personId}-${index}`}
                          onClick={() => handlePersonClick(followUp.personId)}
                          className="group absolute flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/20 transition-all duration-200"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          aria-label={`Follow up with ${followUp.person}`}
                        >
                          <span className="text-sm font-semibold text-foreground opacity-80 group-hover:opacity-100">
                            {followUp.person?.charAt(0) || 'U'}
                          </span>
                          <span className="text-[8px] text-muted-foreground opacity-60 group-hover:opacity-80 mt-0.5">
                            {followUp.person?.split(' ')[0] || 'User'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
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
            
            {latestInteractions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No recent interactions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestInteractions.map((interaction: any, index: number) => (
                  <article 
                    key={index}
                    onClick={() => {
                      // Navigate to person detail or conversation
                      if (interaction.participants && interaction.participants[0]?.personId) {
                        handlePersonClick(interaction.participants[0].personId._id);
                      }
                    }}
                    className="bg-primary/20 rounded-xl p-3.5 hover:bg-primary/30 transition-colors cursor-pointer border border-primary/30"
                  >
                    <h4 className="text-sm lg:text-base font-semibold text-foreground mb-1 opacity-90">
                      {interaction.participants
                        ? interaction.participants
                            .filter((p: any) => !p.isUser)
                            .map((p: any) => p.name)
                            .join(', ')
                        : 'Unknown'}
                    </h4>
                    <p className="text-xs text-muted-foreground opacity-70 mb-1.5">
                      {interaction.title || interaction.summary?.short || 'Conversation'}
                    </p>
                    <time className="text-xs text-muted-foreground opacity-60">
                      {new Date(interaction.conversationDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PersonalIntelligence;