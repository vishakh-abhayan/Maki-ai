import { Download, Settings, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import Calendar from "@/components/Calendar";
import TasksList from "@/components/TasksList";
import RemindersList from "@/components/RemindersList";

const Index = () => {
  return (
    <div className="h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">maki.ai</h1>
            <p className="text-xs text-muted-foreground mt-1">Hey, Aditya!</p>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center">
              <Download className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center">
              <Settings className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden lg:flex justify-end gap-3 mb-8">
          <div>

           {/* <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">maki.ai</h1>
        </div> */}

        {/* User Avatar & Greeting */}
        {/* <div className="w-full mb-8">
          <div className="w-14 h-14 rounded-full border-2 border-border bg-card/50 flex items-center justify-center mb-3 mx-auto">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
        </div> */}
          
        </div>
          <button className="w-10 h-10 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/60 transition-all">
            <Download className="w-5 h-5 text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/60 transition-all">
            <Settings className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <VoiceAssistant />
            <TasksList />
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <Calendar />
            <RemindersList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
