import { cn } from "@/lib/utils";

const CalendarWidget = () => {
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDate = 15;
  
  // Generate calendar days for September 2025 (starts on Monday)
  const calendarDays = [
    null, // Sunday empty
    1, 2, 3, 4, 5, 6, // Week 1
    7, 8, 9, 10, 11, 12, 13, // Week 2
    14, 15, 16, 17, 18, 19, 20, // Week 3
    21, 22, 23, 24, 25, 26, 27, // Week 4
    28, 29, 30, // Week 5
  ];

  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6">September, 2025</h2>
      
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className="text-center text-sm font-medium text-subtle"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              disabled={day === null}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200",
                day === null && "invisible",
                day !== null && "hover:bg-white/5 hover:scale-105",
                day === currentDate && "bg-primary/20 text-primary ring-2 ring-primary/30"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
