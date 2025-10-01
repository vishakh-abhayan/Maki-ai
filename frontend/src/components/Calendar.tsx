const Calendar = () => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [
    [null, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, null, null, null, null],
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-medium text-foreground mb-4 md:mb-6 text-center">
        September, 2025
      </h3>
      
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {/* Day headers */}
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-xs md:text-sm text-muted-foreground font-medium">
            {day}
          </div>
        ))}
        
        {/* Date cells */}
        {dates.flat().map((date, index) => (
          <div
            key={index}
            className={`text-center py-1.5 md:py-2 text-xs md:text-sm ${
              date
                ? 'text-foreground hover:bg-card/50 rounded-lg transition-colors cursor-pointer'
                : ''
            }`}
          >
            {date || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
