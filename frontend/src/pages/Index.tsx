import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CalendarWidget from "@/components/CalendarWidget";
import TaskList from "@/components/TaskList";
import RemindersList from "@/components/RemindersList";
import { Task } from "@/components/TaskItem";
import { Reminder } from "@/components/ReminderCard";


const placeholderTasks: Task[] = [
  {
    id: "1",
    title: "Buy new outfit for Hinge date",
    source: "Date with Sarah",
    dueDate: "Today, 7:00 PM",
    completed: false,
  },
  {
    id: "2",
    title: "Prepare presentation for marketing meeting",
    source: "Team Standup",
    dueDate: "Tomorrow, 2:00 PM",
    priority: "high",
    completed: false,
  },
  {
    id: "3",
    title: "Call dentist for appointment",
    source: "Conversation with mom",
    dueDate: "Today, 10:30 AM",
    completed: true,
  },
];

const placeholderReminders: Reminder[] = [
  {
    id: "1",
    title: "Call Grandma",
    source: "Call with Mom",
    time: "Today at 7:00 PM",
    type: "call",
  },
  {
    id: "2",
    title: "Call Grandma",
    source: "Call with Mom",
    time: "Today at 7:00 PM",
    type: "call",
  },
  {
    id: "3",
    title: "Marketing Team Meeting",
    source: "Meeting with Head of Marketing",
    time: "Tomorrow at 2:00 PM",
    type: "meeting",
  },
  {
    id: "4",
    title: "Marketing Team Meeting",
    source: "Meeting with Dept of Marketing",
    time: "Tomorrow at 2:00 PM",
    type: "meeting",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Sidebar activeItem="home" />
      
      <div className="ml-20 flex min-h-screen">
        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl relative z-10">
          <Header userName="Aditya" />
          
          <div className="space-y-6">
            <CalendarWidget />
            <TaskList tasks={placeholderTasks} />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-96 p-8 border-l border-white/5 hidden xl:block relative z-10">
          <RemindersList reminders={placeholderReminders} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
