
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ScheduleEvent } from '@/types';
import ScheduleEventComponent from './ScheduleEvent';

interface WeekViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  // Get the start of the week (Sunday)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Create an array of 7 days starting from the start date
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    const dayEvents = events.filter(event => event.day === i);
    const dayName = format(date, 'EEE');
    const dayNumber = format(date, 'd');
    
    return { date, dayName, dayNumber, events: dayEvents };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day, index) => (
        <div key={index} className="border rounded-lg">
          <div className="bg-gray-100 p-2 text-center rounded-t-lg">
            <div className="font-medium">{day.dayName}</div>
            <div className="text-2xl font-bold">{day.dayNumber}</div>
          </div>
          <div className="p-2 min-h-[200px]">
            {day.events.length > 0 ? (
              day.events.map(event => (
                <ScheduleEventComponent key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-8">No classes</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;
