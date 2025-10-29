import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";
import { createAPIService, TranscriptResponse } from "@/services/api";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptData, setTranscriptData] =
    useState<TranscriptResponse | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { triggerRefresh } = useDataRefresh();

  const apiService = createAPIService(getToken);

  const MIN_RECORDING_DURATION = 2000; // 2 seconds in milliseconds

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordingDuration = Date.now() - recordingStartTimeRef.current;
        stream.getTracks().forEach((track) => track.stop());

        // Check if recording duration is too short
        if (recordingDuration < MIN_RECORDING_DURATION) {
          toast({
            title: "Recording too short",
            description: "Please speak for at least 2 seconds",
          });
          setIsProcessing(false);
          audioChunksRef.current = [];
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size > 0) {
          await sendAudioToBackend(audioBlob, mimeType);
        } else {
          toast({
            title: "Recording failed",
            description: "No audio data was captured",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Maki is listening...",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob, mimeType: string) => {
    try {
      const timestamp = new Date().getTime();
      const extension = mimeType.includes("webm") ? "webm" : "mp4";

      const audioFile = new File(
        [audioBlob],
        `recording_${timestamp}.${extension}`,
        { type: mimeType }
      );

      console.log("Sending audio file:", {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type,
      });

      const data = await apiService.uploadAudio(audioFile);

      console.log("Transcription response:", data);
      setTranscriptData(data);

      let description = "Your audio has been processed successfully.";

      if (data.metadata) {
        const { numSpeakers, detectedLanguage, wasTranslated } = data.metadata;

        description = `${numSpeakers} speaker${
          numSpeakers > 1 ? "s" : ""
        } detected`;

        if (wasTranslated) {
          description += ` (translated from ${detectedLanguage} to English)`;
        } else if (detectedLanguage && detectedLanguage !== "en") {
          description += ` (${detectedLanguage})`;
        }
      }

      toast({
        title: "Transcription complete!",
        description: description,
      });

      setTimeout(() => {
        triggerRefresh();
      }, 500);
    } catch (error) {
      console.error("Error sending audio to backend:", error);
      toast({
        title: "Transcription failed",
        description: "There was an error processing your audio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 md:py-12 w-full max-w-4xl mx-auto px-4">
      <div className="relative mb-8">
        {isRecording && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
              style={{ animationDuration: "2s" }}
            />
            <div
              className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"
              style={{ animationDuration: "3s" }}
            />
          </>
        )}

        <div className="glass-container p-1 rounded-full">
          <button
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`relative w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isRecording
                ? "bg-red-500/20 hover:bg-red-500/30 border-red-500"
                : "glass-card hover:bg-card/80"
            } ${
              isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-foreground animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
            ) : (
              <Mic className="w-12 h-12 md:w-16 md:h-16 text-foreground" />
            )}
          </button>
        </div>
      </div>

      <p className="mt-4 md:mt-6 text-base md:text-lg text-foreground font-medium">
        {isProcessing
          ? "Processing..."
          : isRecording
          ? "Stop listening"
          : "Let Maki listen"}
      </p>
    </div>
  );
};

export default VoiceAssistant;
