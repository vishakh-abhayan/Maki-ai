import { useState, useEffect } from "react";
import { Download, Settings, Calendar as CalendarIcon, MessageSquare, Clock } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import Sidebar from "@/components/Sidebar";
import { createAPIService, Task, Reminder } from "@/services/api";
import { useAuth } from "@clerk/clerk-react";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

const Activities = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { refreshTrigger } = useDataRefresh();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const apiService = createAPIService(getToken);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, remindersData] = await Promise.all([
        apiService.getTasks(),
        apiService.getReminders()
      ]);
      setTasks(tasksData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await apiService.updateTaskStatus(taskId, !currentStatus);
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, completed: !currentStatus } : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-[#ad1515] text-white';
      case 'medium':
        return 'bg-[#cf8600] text-white';
      case 'low':
        return 'bg-[#2da019] text-white';
      default:
        return '';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return '';
    }
  };

  const getReminderIconColor = (category: string) => {
    switch (category) {
      case 'call':
        return 'bg-[#c48600]';
      case 'meeting':
        return 'bg-indigo-500';
      default:
        return 'bg-[#c48600]';
    }
  };

  const getReminderBorderColor = (category: string) => {
    switch (category) {
      case 'call':
        return 'border-[#c48600]/30';
      case 'meeting':
        return 'border-indigo-500/30';
      default:
        return 'border-[#c48600]/30';
    }
  };

  return (
    <div className="min-h-screen flex lg:pl-[170px] pb-16 lg:pb-0">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
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
                <h2 className="text-2xl font-semibold text-foreground">Activities</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Keep track, stay ahead.</p>
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
        <div className="hidden lg:block mb-20">
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
          
          {/* Activities Header - Not Absolute */}
          <div className="pt-6">
            <h2 className="text-4xl font-semibold text-foreground">Activities</h2>
            <p className="text-base text-muted-foreground mt-1">Keep track, stay ahead.</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-2 gap-6">
          {/* Tasks Section */}
          <section className="glass-container p-2 mb-6 lg:mb-0 h-fit">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6 border-b border-border/20 pb-4">
                <h3 className="text-2xl font-medium text-foreground">Tasks to do</h3>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 rounded-xl text-white text-xs font-semibold hover:bg-blue-600 transition-all">
                  + Add task
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-card/20 border-0"
                    >
                      <label className="cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task._id, task.completed)}
                          className="sr-only"
                        />
                        <span
                          className={`block w-5 h-5 rounded border-2 flex items-center justify-center ${
                            task.completed
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4.5L4.5 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                      </label>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-base font-normal text-foreground mb-1 ${task.completed ? 'line-through opacity-75' : ''}`}>
                          {task.title}
                        </h4>
                        {task.from && (
                          <p className="text-xs text-muted-foreground/60 mb-2">
                            From: {task.from}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.priority !== 'normal' && (
                            <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getPriorityStyles(task.priority)}`}>
                              {getPriorityLabel(task.priority)}
                            </span>
                          )}
                          <p className="text-sm text-muted-foreground/60">
                            Due: {task.dueDateText || 'No due date'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Reminders Section - Don't Forget */}
          <section className="glass-container p-2 h-fit">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6 border-b border-border/20 pb-4">
                <h3 className="text-2xl font-medium text-foreground">Don't Forget</h3>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 rounded-xl text-white text-xs font-semibold hover:bg-blue-600 transition-all">
                  + Add reminder
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading reminders...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No reminders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${getReminderBorderColor(reminder.category)} bg-card/10`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${getReminderIconColor(reminder.category)} flex items-center justify-center flex-shrink-0`}>
                        {reminder.category === 'meeting' ? (
                          <CalendarIcon className="w-4 h-4 text-white" />
                        ) : reminder.category === 'call' ? (
                          <MessageSquare className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-normal text-foreground mb-1">
                          {reminder.title}
                        </h4>
                        {reminder.from && (
                          <p className="text-xs text-muted-foreground/60 mb-1">
                            From: {reminder.from}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground/60">
                          {reminder.dueDateText || 'No date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="h-10 lg:hidden"></div>
      </main>
    </div>
  );
};

export default Activities;