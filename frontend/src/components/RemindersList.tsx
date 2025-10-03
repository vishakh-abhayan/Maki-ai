import { Phone, Calendar as CalendarIcon, Heart } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  from: string;
  time: string;
  icon: 'phone' | 'calendar' | 'heart';
  iconColor: 'success' | 'purple' | 'destructive';
}

const RemindersList = () => {
  const reminders: Reminder[] = [
    {
      id: '1',
      title: 'Call Grandma',
      from: 'Call with Mom',
      time: 'Today at 7:00 P.M.',
      icon: 'phone',
      iconColor: 'success',
    },
    {
      id: '2',
      title: 'Marketing Team Meeting',
      from: 'Meeting with Head of Marketing',
      time: 'Tomorrow at 2:01 P.M.',
      icon: 'calendar',
      iconColor: 'purple',
    },
   
  ];

  const getIcon = (type: Reminder['icon']) => {
    switch (type) {
      case 'phone':
        return Phone;
      case 'calendar':
        return CalendarIcon;
      case 'heart':
        return Heart;
    }
  };

  const getIconBgColor = (color: Reminder['iconColor']) => {
    switch (color) {
      case 'success':
        return 'bg-success';
      case 'purple':
        return 'bg-purple';
      case 'destructive':
        return 'bg-destructive';
    }
  };2112

  return (
    <div className="glass-container p-2 md:mb-14">

    <div className="glass-card md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-medium text-foreground text-center md:text-left">Upcoming Reminders</h3>
        <button className="text-xs md:text-sm  hover:text-foreground transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {reminders.map((reminder) => {
          const Icon = getIcon(reminder.icon);
          return (
            <div
            key={reminder.id}
            className={`p-3 md:p-4 rounded-xl border transition-all ${
              reminder.iconColor === 'destructive'
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-card-border bg-transparent'
              }`}
            >
              <div className="flex items-start gap-2 md:gap-3">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${getIconBgColor(
                    reminder.iconColor
                  )} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-foreground mb-0.5 md:mb-1">
                    {reminder.title}
                  </p>
                  {reminder.from && (
                    <p className="text-[10px] md:text-xs  mb-0.5 md:mb-1">
                      From: {reminder.from}
                    </p>
                  )}
                  <p className="text-[10px] md:text-xs ">{reminder.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default RemindersList;
