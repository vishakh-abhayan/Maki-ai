import { useState, useEffect } from "react";
import {
  Download,
  Settings,
  Mic,
  Users,
  MessageCircle,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import Header from "../components/Header";

interface ConversationHistory {
  _id: string;
  title: string;
  participants: Array<{
    _id: string;
    name: string;
    isUser: boolean;
  }>;
  summary: {
    short: string;
    extended: string;
  };
  conversationDate: string;
  duration: number;
  tags: string[];
  transcriptId: string;
}

const History = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { refreshTrigger } = useDataRefresh();

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    ConversationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.participants.some((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          conv.summary.short
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conv.summary.extended
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
      setFilteredConversations(data.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
      setConversations([]);
      setFilteredConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (conversationId: string) => {
    navigate(`/history/${conversationId}`);
  };

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent navigation when clicking delete

    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // Remove from local state
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      setFilteredConversations((prev) =>
        prev.filter((c) => c._id !== conversationId)
      );
    } catch (err) {
      console.error("Error deleting conversation:", err);
      alert("Failed to delete conversation");
    }
  };

  const getParticipantNames = (
    participants: Array<{ name: string; isUser: boolean }>
  ) => {
    return participants
      .filter((p) => !p.isUser)
      .map((p) => p.name)
      .join(", ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (diffInDays < 2) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}mins` : `${hours}h`;
  };

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
        <Header logoImage="/favicon.ico" showDivider={true} />

        {/* Page Title - Separate */}
        <div className="mb-6 lg:mb-12 mt-4 lg:mt-16">
          <h2 className="text-2xl lg:text-4xl font-semibold text-foreground ml-5 lg:ml-0">
            History
          </h2>
          <p className="text-sm lg:text-base text-muted-foreground mt-0.5 lg:mt-1 opacity-60 ml-5 lg:ml-0">
            Your past conversations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="glass-container p-1">
            <div className="glass-card px-6 py-4 rounded-full flex items-center gap-4">
              <svg
                className="w-6 h-6 text-muted-foreground opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your history"
                className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground placeholder:opacity-60"
              />
              <button className="p-2 hover:bg-card/60 rounded-lg transition-all">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* Conversation History List */}
        <div className="glass-container p-2">
          <div className="glass-card p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg text-muted-foreground">
                  Loading conversations...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg text-red-400 mb-2">
                  Failed to load conversations
                </p>
                <p className="text-sm text-muted-foreground opacity-60 mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchConversations}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-card/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-muted-foreground opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg text-muted-foreground">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
                <p className="text-sm text-muted-foreground opacity-60 mt-2">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Start a conversation to see your history"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredConversations.map((conversation) => {
                  const convDate = new Date(conversation.conversationDate);
                  const month = convDate
                    .toLocaleString("en-US", { month: "short" })
                    .toUpperCase();
                  const day = convDate.getDate();

                  return (
                    <div
                      key={conversation._id}
                      onClick={() => handleViewDetails(conversation._id)}
                      className="p-6 rounded-lg border border-white/25 hover:border-white/50 transition-all bg-card/5 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* Calendar Icon */}
                        <div className="w-12 h-12 rounded-lg bg-[#e74c3c] flex flex-col items-center justify-center text-white flex-shrink-0">
                          <span className="text-xs font-medium">{month}</span>
                          <span className="text-lg font-bold leading-none">
                            {day}
                          </span>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-1">
                                {conversation.title}
                              </h3>
                              <p className="text-base text-muted-foreground/80">
                                With{" "}
                                {getParticipantNames(conversation.participants)}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <p className="text-sm text-muted-foreground/60 whitespace-nowrap">
                                {formatDate(conversation.conversationDate)}
                              </p>
                              <p className="text-sm text-muted-foreground/60">
                                {formatDuration(conversation.duration)}
                              </p>
                            </div>
                          </div>

                          <p className="text-lg text-muted-foreground mb-4">
                            {conversation.summary.short ||
                              conversation.summary.extended}
                          </p>

                          {/* Bottom Row with Icons and Button */}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/history/${conversation._id}/transcript`
                                  );
                                }}
                                className="p-2 hover:bg-card/50 rounded-lg transition-all"
                              >
                                <MessageCircle className="w-5 h-5 text-primary" />
                              </button>
                              <button
                                onClick={(e) =>
                                  handleDeleteConversation(conversation._id, e)
                                }
                                className="p-2 hover:bg-card/50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-5 h-5 text-primary" />
                              </button>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(conversation._id);
                              }}
                              className="px-6 py-2.5 bg-blue-700 rounded-[20px] text-white text-xs font-semibold hover:bg-blue-600 transition-all"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="h-10 lg:hidden"></div>
      </main>
    </div>
  );
};

export default History;
