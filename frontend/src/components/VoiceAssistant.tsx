import { Mic } from "lucide-react";

const VoiceAssistant = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6 md:py-12">
      <div className="relative">
        {/* Animated pulse rings */}
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" style={{ animationDuration: '3s' }} />
        
        {/* Main button */}
        <button className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-card/60 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/80 transition-all shadow-xl">
          <Mic className="w-12 h-12 md:w-16 md:h-16 text-foreground" />
        </button>
      </div>
      
      <p className="mt-4 md:mt-6 text-base md:text-lg text-foreground">Maki is listening...</p>
    </div>
  );
};

export default VoiceAssistant;
