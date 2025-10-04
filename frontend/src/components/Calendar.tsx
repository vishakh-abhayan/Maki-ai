import { useState, useEffect } from 'react';
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
      <div className="glass-card p-4 md:p-6 lg:px-12 lg:py-6">
        <h3 className="text-lg md:text-xl font-medium text-foreground mb-4 md:mb-6 text-center">
          {format(currentDate, 'MMMM, yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-2 md:gap-4 lg:gap-10">
          {/* Day headers */}
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-xs md:text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Date cells */}
          {allCells.map((date, index) => {
            const isToday = date && isSameDay(date, today);
            
            return (
              <div
                key={index}
                className={`text-center py-1.5 md:py-2 text-xs md:text-sm rounded-lg transition-colors ${
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