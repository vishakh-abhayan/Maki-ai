import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

const Calendar = () => {
  const [currentDate] = useState(new Date());
  const today = new Date();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = getDay(monthStart);
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Create empty cells for days before month starts
  const emptyCells = Array(startDayOfWeek).fill(null);
  const allCells = [...emptyCells, ...daysInMonth];

  return (
    <div className="glass-container p-2">
      <div className="glass-card p-5 lg:p-10">
        <h3 className="text-base lg:text-xl font-medium text-foreground mb-5 lg:mb-6 text-left border-t-2 border-gray-100/10 pb-1">
          {format(currentDate, 'MMMM, yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-3 lg:gap-5">
          {/* Day headers */}
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-xs lg:text-sm font-medium text-muted-foreground pb-2">
              {day}
            </div>
          ))}
          
          {/* Date cells */}
          {allCells.map((date, index) => {
            const isToday = date && isSameDay(date, today);
            
            return (
              <div
                key={index}
                className={`text-center py-3 lg:py-3.5 text-xs lg:text-sm rounded-lg transition-colors ${
                  date
                    ? isToday
                      ? 'bg-card/50 text-primary-foreground font-semibold'
                      : 'text-foreground hover:bg-card/50 cursor-pointer'
                    : ''
                }`}
              >
                {date ? format(date, 'd') : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;