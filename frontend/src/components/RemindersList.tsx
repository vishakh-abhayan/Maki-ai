import { Mic } from "lucide-react";
import ReminderCard, { Reminder } from "./ReminderCard";

interface RemindersListProps {
  reminders: Reminder[];
}

const RemindersList = ({ reminders }: RemindersListProps) => {
  return (
    <div className="space-y-6">
      {/* Listening Status */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 glass-circle flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
          <Mic className="w-12 h-12 text-primary relative z-10" />
        </div>
        <p className="text-sm text-subtle">Maki is listening...</p>
      </div>

      {/* Upcoming Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
          <button className="text-sm text-primary hover:text-primary-glow transition-colors">
            View all
          </button>
        </div>

        <div className="space-y-3">
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemindersList;
