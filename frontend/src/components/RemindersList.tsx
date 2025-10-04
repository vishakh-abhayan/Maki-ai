import { useEffect, useState } from "react";
import { Phone, Calendar as CalendarIcon, MessageSquare, User } from "lucide-react";
import { apiService, Reminder } from "@/services/api";
import { format, parseISO } from "date-fns";
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

  const getIconColor = (category: string) => {
    if (category === 'call') {
      return 'bg-green-500';
    }
    return 'bg-destructive';
  };

  const getCardStyle = (category: string) => {
    if (category === 'call') {
      return 'border-green-500/50 bg-green-500/5';
    }
    return 'border-destructive/50 bg-destructive/5';
  };

  const formatDueDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date';
    
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d \'at\' h:mm a');
    } catch (e) {
      console.error('Error parsing date:', e);
      return 'Invalid date';
    }
  };

  const formatFromText = (text: string | null): string => {
    if (!text) return 'Not specified';
    return text.charAt(0).toUpperCase() + text.slice(1);
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
              const iconBgColor = getIconColor(reminder.category);
              const cardStyle = getCardStyle(reminder.category);
              
              return (
                <div
                  key={reminder._id}
                  className={`p-3 md:p-4 rounded-xl border transition-all ${cardStyle}`}
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
                      <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                        From: {formatFromText(reminder.due_date_text)}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        Due: {formatDueDate(reminder.due_date)}
                      </p>
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