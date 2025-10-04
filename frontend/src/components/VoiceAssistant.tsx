import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

interface TranscriptResponse {
  transcript: string;
  insights: {
    [speaker: string]: {
      action_items: string[];
      key_information: string[];
    };
  };
  reminders?: any[];
}

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { triggerRefresh } = useDataRefresh(); // Get refresh function

  // Hardcoded number of speakers
  const NUM_SPEAKERS = 2;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      // Use webm format (we'll convert later if needed)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioToBackend(audioBlob, mimeType);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak into your microphone...",
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
      
      // Determine file extension based on mime type
      const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
      
      // Create file with proper extension
      const audioFile = new File(
        [audioBlob], 
        `recording_${timestamp}.${extension}`, 
        { type: mimeType }
      );

      console.log('Sending audio file:', {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type,
        speakers: NUM_SPEAKERS
      });

      // Prepare form data
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('num_speakers', NUM_SPEAKERS.toString());

      // Send to backend
      const response = await fetch(`${BACKEND_URL}/transcribe/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: TranscriptResponse = await response.json();
      console.log('Transcription response:', data);
      
      setTranscriptData(data);
      
      toast({
        title: "Transcription complete!",
        description: "Your audio has been processed successfully.",
      });

      // 🔥 TRIGGER REFRESH OF TASKS AND REMINDERS
      // Add a small delay to ensure backend has finished processing
      setTimeout(() => {
        triggerRefresh();
      }, 500);

    } catch (error) {
      console.error("Error sending audio to backend:", error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "There was an error processing your audio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <div className="flex flex-col items-center  justify-center py-6 md:py-12 w-full max-w-4xl mx-auto px-4">
      <div className="relative mb-8">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '3s' }} />
          </>
        )}
        
        {/* Main button */}
        <div className="glass-container p-1  rounded-full">
        <button 
          onClick={handleMicClick}
          disabled={isProcessing}
          className={`relative w-32 h-32 md:w-56 md:h-56 rounded-full  flex items-center justify-center transition-all shadow-xl ${
            isRecording 
              ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500' 
              : 'glass-card hover:bg-card/80 '
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
          ? "Processing your audio..." 
          : isRecording 
            ? "Click to stop recording" 
            : "Click to start recording"
        }
      </p>
    </div>
  );
};

export default VoiceAssistant;