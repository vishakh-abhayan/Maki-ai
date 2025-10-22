import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageSquare, Mail, Calendar } from "lucide-react";
import { mockConversationDetails } from "@/mocks/testData";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createAPIService, Person } from "@/services/api";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";

const PersonDetail = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  const apiService = createAPIService(getToken);

  useEffect(() => {
    if (personId) {
      fetchPersonDetails();
    }
  }, [personId]);

  const fetchPersonDetails = async () => {
    if (!personId) return;

    try {
      setLoading(true);
      const data = await apiService.getPersonDetails(personId);
      setPerson(data);
    } catch (error) {
      console.error("Failed to fetch person details:", error);
      toast({
        title: "Error",
        description: "Failed to load person details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    if (!person) return;

    try {
      await apiService.initiateContact(person.id, "call");
      toast({
        title: "Call Initiated",
        description: `Calling ${person.name}...`,
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <Header logoImage="/favicon.ico" showDivider={true} />
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">Loading person details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <Header logoImage="/favicon.ico" showDivider={true} />
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Person not found</p>
              <button
                onClick={() => navigate("/personal-intelligence")}
                className="text-primary hover:underline"
              >
                Back to Personal Intelligence
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
        {/* Header Component */}
        <Header logoImage="/favicon.ico" showDivider={true} />

        {/* Page Title - Separate with Back Button */}
        <div className="mb-6 lg:mb-12 mt-4 lg:mt-16">
          <div className="flex items-center gap-4 ml-5 lg:ml-0">
            <button
              onClick={() => navigate("/personal-intelligence")}
              className="p-2 hover:bg-card/60 rounded-lg transition-all opacity-60 hover:opacity-100"
            >
              <ArrowLeft className="w-5 lg:w-6 h-5 lg:h-6 text-foreground" />
            </button>
            <div>
              <h2 className="text-2xl lg:text-4xl font-semibold text-foreground">
                Personal Intelligence
              </h2>
              <p className="text-sm lg:text-base text-muted-foreground mt-0.5 lg:mt-1 opacity-60">
                Understanding people, made easier
              </p>
            </div>
          </div>
        </div>

        {/* Person Profile Card */}
        <div className="glass-container rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-1">
                    {person.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {person.relationship.displayText}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Last contacted:</span>
                  <span className="text-muted-foreground">
                    {person.communication.lastContactedFormatted}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Communication Frequency:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      person.communication.frequencyBadgeColor === "green"
                        ? "bg-green-600 text-white"
                        : person.communication.frequencyBadgeColor === "blue"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {person.communication.frequencyLabel}
                  </span>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-6">
                <h4 className="text-xl font-medium text-foreground mb-3 border-b border-border/30 pb-2">
                  About {person.name.split(" ")[0]}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {person.profile.summary}
                </p>
              </div>

              {/* Hobbies/Interests */}
              {person.profile.hobbies && person.profile.hobbies.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-medium">Hobbies/Interests:</span>{" "}
                    {person.profile.hobbies.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Closeness Score */}
            <div className="flex items-center justify-center lg:w-[250px]">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-primary/20"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 88 * (1 - person.sentiment.closenessScore)
                    }`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Closeness
                  </p>
                  <p className="text-5xl font-bold text-foreground">
                    {person.sentiment.closenessPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        {person.recentConversations &&
          person.recentConversations.length > 0 && (
            <div className="glass-container rounded-3xl p-6 lg:p-8">
              <h4 className="text-xl font-medium text-foreground mb-5 border-b border-border/30 pb-3">
                Recent Conversations
              </h4>
              <div className="space-y-4">
                {person.recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="bg-primary/10 rounded-xl p-4 hover:bg-primary/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/history`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-base font-semibold text-foreground">
                        {conv.title}
                      </h5>
                      <span className="text-xs text-muted-foreground">
                        {conv.dateFormatted}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {conv.summary}
                    </p>
                    <div className="flex items-center gap-2">
                      {conv.tags &&
                        conv.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs bg-primary/30 text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="h-10 lg:hidden"></div>
      </main>
    </div>
  );
};

export default PersonDetail;
