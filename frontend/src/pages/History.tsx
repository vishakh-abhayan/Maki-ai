// frontend/src/pages/History.tsx
import { useState, useEffect } from "react";
import { Download, Settings, Mic, Users, MessageCircle, Trash2, SlidersHorizontal } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/clerk-react";

interface ConversationHistory {
  id: string;
  title: string;
  participants: string;
  summary: string;
  date: string;
  duration: string;
  tags: string[];
}

const History = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationHistory[]>([
    {
      id: "1",
      title: "Weekly Team Sync",
      participants: "Alex Johnson, Sarah Cooper",
      summary: "Discussed project milestones and assigned task for the week.",
      date: "Today, 10.00 A.M.",
      duration: "30mins",
      tags: ["Meeting", "Team", "Planning"]
    },
    {
      id: "2",
      title: "Client Check-in",
      participants: "John Cena",
      summary: "Reviewed progress on the website redesign and gathered feedback.",
      date: "Yesterday, 05.00 P.M.",
      duration: "15mins",
      tags: ["Client", "Progress", "Feedback"]
    },
    {
      id: "3",
      title: "Client Check-in",
      participants: "Scarlet Johanson",
      summary: "Reviewed progress on the website redesign and gathered feedback.",
      date: "Yesterday, 2.00 P.M.",
      duration: "15mins",
      tags: ["Client", "Design", "Review"]
    }
  ]);

  const [filteredConversations, setFilteredConversations] = useState(conversations);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const handleViewDetails = (id: string) => {
    console.log("View details for conversation:", id);
    // TODO: Implement view details functionality
  };

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
              <div className="ml-5">
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
                <UserButton />
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
                <UserButton />
              </SignedIn>
            </div>
          </div>
          
          <div className="flex items-start justify-between pt-16">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-4xl font-semibold text-foreground">History</h2>
                <p className="text-base text-muted-foreground mt-1 opacity-60">Your past conversations</p>
              </div>
            </div>
            
            {/* Maki Listening Button */}
            {/* <button
              type="button"
              className="relative w-[279px] h-[60px] rounded-[20px] overflow-hidden bg-gradient-to-r from-[#0b3cb8] to-[#115bcc] hover:from-[#0a34a0] hover:to-[#0f4fb8] transition-all"
            >
              <div className="inline-flex items-center gap-4 relative top-[calc(50%-21px)] left-[calc(50%-75px)]">
                <div className="relative w-[42px] h-[42px] bg-white/10 rounded-[23px] border border-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] text-white font-normal">
                  Maki is listening...
                </span>
              </div>
            </button> */}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="glass-container p-1">
            <div className="glass-card px-6 py-4 rounded-full flex items-center gap-4">
              <svg className="w-6 h-6 text-muted-foreground opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            <div className="space-y-6">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-20 h-20 rounded-full bg-card/50 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-muted-foreground opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-lg text-muted-foreground">No conversations found</p>
                  <p className="text-sm text-muted-foreground opacity-60 mt-2">Try adjusting your search query</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-6 rounded-lg border border-white/25 hover:border-white/50 transition-all bg-card/5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Calendar Icon */}
                      <div className="w-12 h-12 rounded-lg bg-[#e74c3c] flex flex-col items-center justify-center text-white flex-shrink-0">
                        <span className="text-xs font-medium">JUL</span>
                        <span className="text-lg font-bold leading-none">17</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {conversation.title}
                            </h3>
                            <p className="text-base text-muted-foreground/80">
                              With {conversation.participants}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="text-sm text-muted-foreground/60 whitespace-nowrap">
                              {conversation.date}
                            </p>
                            <p className="text-sm text-muted-foreground/60">
                              {conversation.duration}
                            </p>
                          </div>
                        </div>

                        <p className="text-lg text-muted-foreground mb-4">
                          {conversation.summary}
                        </p>

                        {/* Bottom Row with Icons and Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3">
                            <button className="p-2 hover:bg-card/50 rounded-lg transition-all">
                              <MessageCircle className="w-5 h-5 text-primary" />
                            </button>
                            <button className="p-2 hover:bg-card/50 rounded-lg transition-all">
                              <Trash2 className="w-5 h-5 text-primary" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleViewDetails(conversation.id)}
                            className="px-6 py-2.5 bg-blue-700 rounded-[20px] text-white text-xs font-semibold hover:bg-blue-600 transition-all"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="h-10 lg:hidden"></div>
      </main>
    </div>
  );
};

export default History;