import { Phone, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Reminder {
  id: string;
  title: string;
  source: string;
  time: string;
  type: 'call' | 'meeting';
}

interface ReminderCardProps {
  reminder: Reminder;
}

const ReminderCard = ({ reminder }: ReminderCardProps) => {
  const Icon = reminder.type === 'call' ? Phone : Calendar;
  const iconColor = reminder.type === 'call' ? 'bg-success' : 'bg-info';

  return (
    <div className="glass-card rounded-2xl p-4 hover:bg-card/70 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          iconColor
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-1">{reminder.title}</h3>
          <p className="text-xs text-subtle mb-1">From: {reminder.source}</p>
          <p className="text-xs text-muted-subtle">{reminder.time}</p>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
