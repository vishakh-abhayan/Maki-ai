import { useEffect, useState } from "react";
import {
  Phone,
  Calendar as CalendarIcon,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { createAPIService, Reminder } from "@/services/api";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { useAuth } from "@clerk/clerk-react";
import { isToday, parseISO, isPast, isFuture, isAfter, format } from "date-fns";
import { useNavigate } from "react-router";

const RemindersList = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();
  const { getToken } = useAuth();

  const apiService = createAPIService(getToken);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReminders();
  }, [refreshTrigger]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getReminders();

      const now = new Date();

      const upcomingReminders = data.filter((item) => {
        // If no due date, show it anyway
        if (!item.dueDate) return true;

        try {
          const reminderDate = parseISO(item.dueDate);

          return isAfter(reminderDate, now) || isToday(reminderDate);
        } catch {
          return true; // Include if date parsing fails
        }
      });

      // Sort by date (earliest first)
      const sorted = upcomingReminders.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      // Limit to 3 reminders
      setReminders(sorted.slice(0, 3));
      setError(null);
    } catch (err) {
      setError("Failed to load reminders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No due date";

    try {
      const date = parseISO(dateString);
      // Returns format like "Oct 28, 2025 at 8:30 AM"
      return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "No due date";
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "call":
        return Phone;
      case "meeting":
        return CalendarIcon;
      case "event":
        return Clock;
      case "personal":
        return User;
      default:
        return MessageSquare;
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "call":
        return "bg-green-500";
      case "meeting":
        return "bg-violet-500";
      case "event":
        return "bg-blue-500";
      case "personal":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCardStyle = (category: string) => {
    switch (category) {
      case "call":
        return "border-green-500/50";
      case "meeting":
        return "border-violet-500/50";
      case "event":
        return "border-blue-500/50";
      case "personal":
        return "border-orange-500/50";
      default:
        return "border-gray-500/50";
    }
  };

  const formatReminderSource = (from: string | null): string => {
    if (!from) return "Unknown";

    if (from.toUpperCase().startsWith("SPEAKER")) {
      const speakerNumber = from.split(" ")[1];
      return `Speaker ${speakerNumber}`;
    }

    return from;
  };

  if (loading) {
    return (
      <div className="glass-container p-2 md:mb-14">
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              Loading reminders...
            </p>
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
          <h3 className="text-lg md:text-xl font-medium text-foreground border-b-2 border-gray-100/10 pb-1">
            Upcoming Reminders
          </h3>
          <button
            onClick={() => navigate("/activities")}
            className="text-xs md:text-sm hover:text-foreground transition-colors"
          >
            View all
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No upcoming reminders
            </p>
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
                        From: {formatReminderSource(reminder.from)}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        Due: {formatDate(reminder.dueDate)}
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
