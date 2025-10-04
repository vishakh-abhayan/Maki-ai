import { useEffect, useState } from "react";
import { Phone, Calendar as CalendarIcon, MessageSquare, User } from "lucide-react";
import { apiService, Reminder } from "@/services/api";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

const RemindersList = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();

  useEffect(() => {
    fetchReminders();
  }, [refreshTrigger]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getReminders();
      const reminderItems = data.filter(
        (item) => 
          !item.completed && 
          (item.category === 'meeting' || 
           item.category === 'call' || 
           item.category === 'personal')
      );
      setReminders(reminderItems);
      setError(null);
    } catch (err) {
      setError('Failed to load reminders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'call':
        return Phone;
      case 'meeting':
        return CalendarIcon;
      case 'personal':
        return User;
      default:
        return MessageSquare;
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive';
      case 'low':
        return 'bg-purple';
      default:
        return 'bg-success';
    }
  };

  const formatReminderTime = (reminder: Reminder): string => {
    if (reminder.due_date_text) {
      return reminder.due_date_text;
    }
    if (reminder.due_date) {
      const date = parseISO(reminder.due_date);
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      }
      if (isTomorrow(date)) {
        return `Tomorrow at ${format(date, 'h:mm a')}`;
      }
      return format(date, 'MMM d \'at\' h:mm a');
    }
    return 'No time set';
  };

  if (loading) {
    return (
      <div className="glass-container p-2 md:mb-14">
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading reminders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-container p-2 md:mb-14">
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-container p-2 md:mb-14">
      <div className="glass-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-medium text-foreground">
            Upcoming Reminders
          </h3>
          <button className="text-xs md:text-sm hover:text-foreground transition-colors">
            View all
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No upcoming reminders</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {reminders.map((reminder) => {
              const Icon = getIcon(reminder.category);
              const iconBgColor = getIconColor(reminder.priority);
              
              return (
                <div
                  key={reminder._id}
                  className={`p-3 md:p-4 rounded-xl border transition-all ${
                    reminder.priority === 'high'
                      ? 'border-destructive/50 bg-destructive/5'
                      : 'border-card-border bg-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-foreground mb-0.5 md:mb-1">
                        {reminder.title}
                      </p>
                      {reminder.from && (
                        <p className="text-[10px] md:text-xs mb-0.5 md:mb-1">
                          From: {reminder.from}
                        </p>
                      )}
                      <p className="text-[10px] md:text-xs">{formatReminderTime(reminder)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersList;