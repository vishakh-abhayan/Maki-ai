import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Settings, ArrowLeft, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTranscript();
    }
  }, [id]);

  const fetchTranscript = async () => {
    try {
      const token = await getToken();

      console.log("Fetching conversation:", id);
      const convRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conversations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!convRes.ok) {
        throw new Error(`Failed to fetch conversation: ${convRes.status}`);
      }

      const convResult = await convRes.json();
      console.log("Conversation API Response:", convResult);

      const conv =
        convResult.success && convResult.data ? convResult.data : convResult;
      console.log("Extracted conversation:", conv);

      setConversationTitle(conv.title || "Untitled Conversation");

      let transcriptId = conv.transcriptId;

      if (!transcriptId) {
        throw new Error("No transcript ID found");
      }

      // If transcriptId is an object, extract the _id or id
      if (typeof transcriptId === "object" && transcriptId !== null) {
        transcriptId = transcriptId._id || transcriptId.id;
      }

      // Convert to string
      transcriptId = transcriptId.toString();

      console.log("Fetching transcript with ID:", transcriptId);

      const transRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/transcribe/${transcriptId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!transRes.ok) {
        throw new Error(`Failed to fetch transcript: ${transRes.status}`);
      }

      const transResult = await transRes.json();
      console.log("Transcript API Response:", transResult);

      const transcriptData =
        transResult.success && transResult.data
          ? transResult.data
          : transResult;

      console.log("Extracted transcript data:", transcriptData);

      if (transcriptData.transcript) {
        const parsed = parseTranscript(
          transcriptData.transcript,
          conv.participants || []
        );
        setMessages(parsed);
      } else {
        console.warn("No transcript text found");
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching transcript:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load transcript"
      );
    } finally {
      setLoading(false);
    }
  };

  const parseTranscript = (
    text: string,
    participants: any[]
  ): TranscriptMessage[] => {
    if (!text) {
      console.error("No transcript text provided");
      return [];
    }

    console.log("Parsing transcript text, length:", text.length);
    console.log("Participants:", participants);

    const segments = text.split(/\n(?=\[\d{2}:\d{2}:\d{2})/);
    const messages: TranscriptMessage[] = [];

    for (const segment of segments) {
      if (!segment.trim()) continue;

      // Match pattern: [timestamp] SPEAKER N:\ntext
      const match = segment.match(
        /\[[\d:\ \-]+\]\s*(SPEAKER\s+\d+):\s*\n?([\s\S]*)/
      );

      if (match) {
        const speakerLabel = match[1].trim();
        const text = match[2].trim();

        if (!text || text === ".") continue; // Skip empty messages

        // Find participant by speaker label
        const participant = participants.find(
          (p) => p.speakerLabel === speakerLabel
        );

        messages.push({
          speaker: participant?.name || speakerLabel,
          text: text,
          isUser: participant?.isUser || false,
        });
      }
    }

    console.log("Parsed messages count:", messages.length);
    return messages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <Header logoImage="/favicon.ico" showDivider={true} />
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-muted-foreground text-xl">
                Loading transcript...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          <Header logoImage="/favicon.ico" showDivider={true} />
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-red-400 text-xl mb-4">
                Failed to load transcript
              </p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => navigate(`/history/${id}`)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                Back to Details
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

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
        <Header logoImage="/favicon.ico" showDivider={true} />

        <div className="mb-6 lg:mb-12 mt-4 lg:mt-16">
          <div className="flex items-center gap-4 ml-5 lg:ml-0">
            <button
              onClick={() => navigate(`/history/${id}`)}
              className="p-2 hover:bg-card/60 rounded-lg transition-all opacity-60 hover:opacity-100"
            >
              <ArrowLeft className="w-5 lg:w-6 h-5 lg:h-6 text-foreground" />
            </button>
            <div>
              <h2 className="text-2xl lg:text-4xl font-semibold text-foreground">
                History
              </h2>
              <p className="text-sm lg:text-base text-muted-foreground mt-0.5 lg:mt-1 opacity-60">
                Your past conversations
              </p>
            </div>
          </div>
        </div>

        <div className="glass-container p-2">
          <div className="glass-card p-8">
            <div className="mb-8">
              <h3 className="text-3xl font-extralight text-foreground tracking-wide mb-2">
                Transcript
              </h3>
              <p className="text-white/50 text-sm">{conversationTitle}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

            <div className="space-y-6 max-h-[650px] overflow-y-auto pr-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 text-lg">
                    No transcript available
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className={`font-semibold text-xl tracking-wide ${
                            msg.isUser ? "text-[#00ffe975]" : "text-[#0082df]"
                          }`}
                        >
                          {msg.speaker}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xl leading-relaxed">
                        {msg.text}
                      </p>
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

export default TranscriptView;
