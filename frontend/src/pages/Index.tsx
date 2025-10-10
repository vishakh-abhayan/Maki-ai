import { Download, Settings, CircleUserRound } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import Calendar from "@/components/Calendar";
import TasksList from "@/components/TasksList";
import RemindersList from "@/components/RemindersList";
import { DataRefreshProvider } from "@/contexts/DataRefreshContext";


import { SignedIn, SignedOut, SignInButton, UserButton,useUser } from '@clerk/clerk-react';




const Index = () => {
  const { user } = useUser();


  return (
    <DataRefreshProvider>
      <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            {/* Logo */}
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-foreground tracking-wide" 
                  style={{ fontFamily: "'Courier New', 'Courier', monospace" }}>
                maki.ai
              </h1>
            </div>
            
            {/* User Info and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                    {/* <CircleUserRound strokeWidth={1.1}  className="h-12 w-12 text-foreground" /> */}
                <div className="ml-5">
                  <p className="text-2xl font-medium text-foreground">Hey, Dev!</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Here's what's important today</p>
                </div>
              </div>
              <div className="flex gap-2  absolute right-4 top-4">
                <button className="w-7 h-7 p-2 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center">
                  <Download className="w-4 h-4 text-foreground" />
                </button>
                <button className="w-7 h-7  p-2 rounded-lg bg-card/40 backdrop-blur-xl border border-card-border flex items-center justify-center">
                  <Settings className="w-4 h-4 text-foreground" />
                </button>
                <SignedOut>
                <SignInButton />
                </SignedOut>
                <SignedIn>
                <UserButton   />
                </SignedIn>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            {/* Logo */}
            <div className="mb-6 absolute top-6 left-8">
              <h1 className="text-xl font-semibold text-foreground fixed tracking-wide" 
                  style={{ fontFamily: "'Courier New', 'Courier', monospace" }}>
                maki.ai
              </h1>
              
            </div>
             <div className=" absolute right-36 top-6 z-10">
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
            
            {/* User Info and Actions */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                    {/* <CircleUserRound strokeWidth={1.2}  className="h-16 w-16 text-foreground" /> */}
                <div className="top-20 right-14 relative">
                  <p className="text-4xl font-medium text-foreground">Hey, {user?.firstName || " "}!</p>
                  <p className="text-base text-muted-foreground mt-1">Here's what's important today</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Content  */}
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
              <RemindersList />
            </div>

            {/* Right Column - Calendar and Reminders */}
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <Calendar />
              <TasksList />
            </div>
          </div>
          <div className="h-10 lg:hidden"></div>
        </main>
      </div>
    </DataRefreshProvider>
  );
};

export default Index;