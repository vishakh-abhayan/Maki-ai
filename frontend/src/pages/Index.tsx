import { Download, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import Calendar from "@/components/Calendar";
import TasksList from "@/components/TasksList";
import RemindersList from "@/components/RemindersList";
import Header from "@/components/Header";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";

const Index = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
        {/* Mobile Header */}
        <Header logoImage="favicon.ico" />

        <div className="mt-6 lg:mt-20 lg:mb-12">
          <p className="text-2xl lg:text-4xl font-medium text-foreground ml-5 lg:ml-0">
            Hey, {user?.firstName || "Dev"}!
          </p>
          <p className="text-sm lg:text-base text-muted-foreground mt-0.5 lg:mt-1 ml-5 lg:ml-0">
            Here's what's important today
          </p>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden space-y-4 md:space-y-6">
          <VoiceAssistant />
          <RemindersList />
          <TasksList />
          <Calendar />
        </div>

        {/* Desktop Content Grid - Mic LEFT, Calendar RIGHT */}
        <div className="hidden lg:grid lg:grid-cols-[1.2fr_1.8fr] gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Voice Assistant and Tasks */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <VoiceAssistant />
            <TasksList />
          </div>

          {/* Right Column - Calendar and Reminders */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            <Calendar />
            <RemindersList />
          </div>
        </div>
        <div className="h-10 lg:hidden"></div>
      </main>
    </div>
  );
};

export default Index;
