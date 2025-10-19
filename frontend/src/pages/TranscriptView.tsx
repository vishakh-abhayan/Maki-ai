import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Settings, ArrowLeft, User } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@clerk/clerk-react";

interface TranscriptMessage {
  speaker: string;
  text: string;
  isUser: boolean;
}

const TranscriptView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [conversationTitle, setConversationTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscript();
  }, [id]);

  const fetchTranscript = async () => {
    try {
      const token = await getToken();
      
      // Fetch conversation
      const convRes = await fetch(
        `${import.meta.env.VITE_API_URL}/conversations/${id}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      const conv = await convRes.json();
      setConversationTitle(conv.title);

      // FIX: Convert transcriptId to string to avoid [object Object]
      const transcriptId = typeof conv.transcriptId === 'object' 
        ? conv.transcriptId._id || conv.transcriptId.toString()
        : conv.transcriptId;

      console.log('Fetching transcript with ID:', transcriptId); // Debug log

      // Fetch transcript
      const transRes = await fetch(
        `${import.meta.env.VITE_API_URL}/transcribe/${transcriptId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (!transRes.ok) {
        throw new Error(`Failed to fetch transcript: ${transRes.status}`);
      }

      const transcriptData = await transRes.json();
      console.log('Transcript data:', transcriptData); // Debug log

      // Parse transcript
      const parsed = parseTranscript(transcriptData.transcript, conv.participants);
      setMessages(parsed);
    } catch (err) {
      console.error("Error fetching transcript:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseTranscript = (text: string, participants: any[]): TranscriptMessage[] => {
    if (!text) {
      console.error('No transcript text provided');
      return [];
    }

    // Split by timestamp pattern: [HH:MM:SS - HH:MM:SS] SPEAKER N:
    const segments = text.split(/\n(?=\[\d{2}:\d{2}:\d{2})/);
    
    const messages: TranscriptMessage[] = [];

    for (const segment of segments) {
      if (!segment.trim()) continue;

      // Match pattern: [timestamp] SPEAKER N:\ntext
      const match = segment.match(/\[[\d:\ \-]+\]\s*(SPEAKER\s+\d+):\s*\n?([\s\S]*)/);
      
      if (match) {
        const speakerLabel = match[1].trim(); // "SPEAKER 1" or "SPEAKER 2"
        const text = match[2].trim();

        if (!text || text === '.') continue; // Skip empty messages

        // Find participant by speaker label
        const participant = participants.find(p => 
          p.speakerLabel === speakerLabel
        );

        messages.push({
          speaker: participant?.name || speakerLabel,
          text: text,
          isUser: participant?.isUser || false,
        });
      }
    }

    console.log('Parsed messages:', messages); // Debug log
    return messages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-white text-xl">Loading transcript...</p>
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
                onClick={() => navigate(`/history/${id}`)}
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
              onClick={() => navigate(`/history/${id}`)}
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

        {/* Transcript Card */}
        <div className="glass-container p-2">
          <div className="glass-card p-8">
            <div className="mb-8">
              <h3 className="text-3xl font-extralight text-white tracking-wide mb-2">
                Transcript
              </h3>
              <p className="text-white/50 text-sm">{conversationTitle}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            {/* Messages */}
            <div className="space-y-6 max-h-[650px] overflow-y-auto pr-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 text-lg">No transcript available</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.isUser 
                        ? "bg-[#00ffe975]/20 text-[#00ffe975]" 
                        : "bg-[#0082df]/20 text-[#0082df]"
                    }`}>
                      <User className="w-5 h-5" />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`font-semibold text-xl tracking-wide ${
                          msg.isUser ? "text-[#00ffe975]" : "text-[#0082df]"
                        }`}>
                          {msg.speaker}
                        </span>
                        
                      </div>
                      <p className="text-white/60 text-xl leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TranscriptView;