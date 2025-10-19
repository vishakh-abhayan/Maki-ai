import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Settings, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/clerk-react";

interface ConversationDetails {
  _id: string;
  title: string;
  summary: {
    short: string;
    extended: string;
  };
  participants: Array<{
    _id: string;
    name: string;
    isUser: boolean;
  }>;
  conversationDate: string;
  duration: number;
  tags: string[];
  transcriptId: string;
}

const HistoryViewDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversationDetails();
  }, [id]);

  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch conversation");
      
      const data = await response.json();
      setConversation(data);
    } catch (err) {
      console.error("Error fetching conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/conversations/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete");
      navigate("/history");
    } catch (err) {
      alert("Failed to delete conversation");
    }
  };

  const getParticipantNames = () => {
    if (!conversation) return "";
    return conversation.participants
      .filter(p => !p.isUser)
      .map(p => p.name)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-white text-xl">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-red-400 text-xl">Conversation not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
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
              <button
                onClick={() => navigate("/history")}
                className="p-2 hover:bg-card/60 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h2 className="text-2xl font-light text-foreground">History</h2>
                <p className="text-sm text-muted-foreground mt-0.5 opacity-60">Your past conversations</p>
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
                
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-12">
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
                
              </SignedIn>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-16">
            <button
              onClick={() => navigate("/history")}
              className="p-2 hover:bg-card/60 rounded-lg transition-all opacity-60 hover:opacity-100"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div>
              <h2 className="text-4xl font-semibold text-foreground">History</h2>
              <p className="text-base text-muted-foreground mt-1 opacity-60">Your past conversations</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="glass-container p-2">
          <div className="glass-card p-8">
            {/* Title and Actions */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h3 className="text-3xl font-semibold text-foreground mb-3">
                  {conversation.title}
                </h3>
                <p className="text-xl font-medium text-white/70">
                  With {getParticipantNames()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/history/${id}/transcript`)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 rounded-[20px] text-white text-sm font-semibold hover:bg-blue-600 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  View transcript
                </button>

                <button
                  onClick={handleDelete}
                  className="p-3 hover:bg-card/50 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            {/* Summary */}
            <div className="max-w-4xl">
              <p className="text-2xl font-normal text-white/70 leading-relaxed">
                {conversation.summary.extended}
              </p>
            </div>

            {/* Tags */}
            {conversation.tags && conversation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {conversation.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/5">
              <div className="text-sm text-white/40">
                <span className="font-medium">Duration:</span> {conversation.duration} min
              </div>
              <div className="text-sm text-white/40">
                <span className="font-medium">Date:</span>{" "}
                {new Date(conversation.conversationDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryViewDetails;