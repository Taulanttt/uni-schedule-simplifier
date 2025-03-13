
import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns';
import { ScheduleEvent } from '@/types';

interface MonthViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
}

const MonthView: React.FC<MonthViewProps> = ({ events, currentDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const rows = [];
  let days = [];
  let day = startDate;

  // Create weeks
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);
      const dayOfWeek = day.getDay();
      const dayEvents = events.filter(event => event.day === dayOfWeek);
      
      // Only show a sample event for the month view to avoid clutter
      const sampleEvent = dayEvents.length > 0 ? dayEvents[0] : null;
      const eventCount = dayEvents.length;
      
      days.push(
        <div
          key={day.toString()}
          className={`border p-1 min-h-[100px] ${!isSameMonth(day, monthStart) ? 'bg-gray-100 text-gray-400' : ''}`}
        >
          <div className="text-right">{format(day, 'd')}</div>
          {sampleEvent && (
            <div className={`text-xs mt-1 p-1 rounded bg-${sampleEvent.type} text-white truncate`}>
              {sampleEvent.title}
              {eventCount > 1 && <div className="text-xs text-right">+{eventCount - 1} more</div>}
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="rounded-lg overflow-hidden border">
      <div className="grid grid-cols-7 bg-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium">{day}</div>
        ))}
      </div>
      <div>{rows}</div>
    </div>
  );
};

export default MonthView;
