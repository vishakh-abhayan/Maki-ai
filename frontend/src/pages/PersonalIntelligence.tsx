import { useState, useEffect } from "react";
import { Download, Settings, Search, Phone } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import {
  createAPIService,
  FollowUp,
  IntelligenceDashboard,
} from "@/services/api";
import { useAuth } from "@clerk/clerk-react";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const PersonalIntelligence = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] =
    useState<IntelligenceDashboard | null>(null);

  const apiService = createAPIService(getToken);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      const data = await apiService.getIntelligenceDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load intelligence dashboard",
        variant: "destructive",
      });
    }
  };

  const handlePersonClick = (personId: string) => {
    navigate(`/person/${personId}`);
  };

  const handleCallPerson = async (personId: string, personName: string) => {
    try {
      await apiService.initiateContact(personId, "call");
      toast({
        title: "Call Initiated",
        description: `Calling ${personName}...`,
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
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
      console.error("Search failed:", error);
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

  const pendingFollowUps = dashboardData?.pendingFollowUps || [];
  const suggestedFollowUps = dashboardData?.suggestedFollowUps || [];
  const latestInteractions = dashboardData?.latestInteractions || [];

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0 overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full overflow-hidden">
        <Header logoImage="favicon.ico" showDivider={true} />

        {/* Page Title - Separate */}
        <div className="mb-6 lg:mb-12 mt-4 lg:mt-16">
          <h2 className="text-2xl lg:text-4xl font-semibold text-foreground ml-5 lg:ml-0">
            Personal Intelligence
          </h2>
          <p className="text-sm lg:text-base text-muted-foreground mt-0.5 lg:mt-1 opacity-60 ml-5 lg:ml-0">
            Understanding people, made easier
          </p>
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
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  aria-label="Search for a name"
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Pending Follow Ups Section */}
            {/* Pending Follow Ups Section - ENHANCED */}
            <section
              className="glass-container rounded-3xl p-6 lg:p-7"
              aria-labelledby="pending-follow-ups-title"
              style={{ height: "340px" }}
            >
              <h3
                id="pending-follow-ups-title"
                className="text-xl lg:text-2xl font-medium text-foreground mb-5 pb-5 border-b border-border/30"
              >
                Pending Follow Ups
              </h3>

              {pendingFollowUps.length === 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-sm text-muted-foreground">
                    No pending follow-ups
                  </p>
                </div>
              ) : (
                <ul className="space-y-4 overflow-y-auto max-h-[220px] pr-2">
                  {pendingFollowUps.map((followUp) => {
                    const priorityConfig = getPriorityConfig(followUp.priority);
                    return (
                      <li key={followUp._id} className="group relative">
                        {/* Person Card - Clickable */}
                        {/* make scrollbar hidden but still scrollable write the code for it  */}
                        <div
                          className="flex items-start  gap-2 p-2 rounded-xl 
                                     hover:bg-primary/20 transition-all cursor-pointer"
                          onClick={() => {
                            if (followUp.personId) {
                              handlePersonClick(followUp.personId);
                            }
                          }}
                        >
                          {/* Avatar/Initial */}
                          {/* <div className="flex-shrink-0">
                            {followUp.avatar ? (
                              <img 
                                src={followUp.avatar} 
                                alt={followUp.person}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                                <span className="text-sm font-semibold text-foreground">
                                  {followUp.initials || followUp.person?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                          </div> */}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Person Name & Relationship */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {followUp.person}
                                </span>
                                <span className="text-xs text-muted-foreground opacity-60 capitalize">
                                  ({followUp.relationship || "acquaintance"})
                                </span>
                              </div>

                              {/* Priority Badge */}
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white ${priorityConfig.bgColor}`}
                                aria-label={`Priority: ${priorityConfig.label}`}
                              >
                                {priorityConfig.label}
                              </span>
                            </div>

                            {/* Follow-up Context */}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {followUp.context}
                            </p>

                            {/* Optional: Conversation Context */}
                            {followUp.conversationTitle && (
                              <p className="text-xs text-muted-foreground opacity-50 mt-1">
                                From: {followUp.conversationTitle}
                              </p>
                            )}
                          </div>
                        </div>
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
              style={{ height: "340px" }}
            >
              <h3
                id="suggested-follow-ups-heading"
                className="text-xl lg:text-2xl font-medium text-foreground mb-5 pb-5 border-b border-border/30"
              >
                Suggested Follow Ups
              </h3>

              <div className="flex justify-center items-center h-[230px]">
                {suggestedFollowUps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No suggestions available
                  </p>
                ) : (
                  <div className="relative w-[240px] h-[240px]">
                    {/* Center Person */}
                    {suggestedFollowUps[0] && (
                      <button
                        onClick={() =>
                          handlePersonClick(suggestedFollowUps[0].personId)
                        }
                        className="group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/20 transition-all duration-200 z-10"
                        aria-label={`Follow up with ${suggestedFollowUps[0].person}`}
                      >
                        <span className="text-base font-semibold text-foreground opacity-80 group-hover:opacity-100">
                          {suggestedFollowUps[0].person?.charAt(0) || "U"}
                        </span>
                        <span className="text-[9px] text-muted-foreground opacity-60 group-hover:opacity-80 mt-0.5">
                          {suggestedFollowUps[0].person?.split(" ")[0] ||
                            "User"}
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
                            transform: "translate(-50%, -50%)",
                          }}
                          aria-label={`Follow up with ${followUp.person}`}
                        >
                          <span className="text-sm font-semibold text-foreground opacity-80 group-hover:opacity-100">
                            {followUp.person?.charAt(0) || "U"}
                          </span>
                          <span className="text-[8px] text-muted-foreground opacity-60 group-hover:opacity-80 mt-0.5">
                            {followUp.person?.split(" ")[0] || "User"}
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
                <p className="text-sm text-muted-foreground">
                  No recent interactions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestInteractions.map((person: any) => (
                  <article
                    key={person.personId}
                    onClick={() => handlePersonClick(person.personId)}
                    className="bg-primary/20 rounded-xl p-4 hover:bg-primary/30 transition-all cursor-pointer border border-primary/30 group"
                  >
                    {/* Person Avatar/Initial */}
                    <div className="flex items-center gap-3 mb-3">
                      {person.avatar ? (
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/40 flex items-center justify-center">
                          <span className="text-lg font-semibold text-foreground">
                            {person.initials}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm lg:text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {person.name}
                        </h4>
                        <p className="text-xs text-muted-foreground opacity-60 capitalize">
                          {person.relationship}
                        </p>
                      </div>
                    </div>

                    {/* Last Conversation Info */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground opacity-70 line-clamp-2">
                        {person.lastConversationTitle ||
                          person.lastConversationSummary ||
                          "Recent conversation"}
                      </p>
                      <time className="text-xs text-muted-foreground opacity-60 block">
                        {new Date(
                          person.lastConversationDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        •{" "}
                        {new Date(
                          person.lastConversationDate
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </time>
                    </div>
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
