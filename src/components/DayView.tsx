
import React from 'react';
import { format } from 'date-fns';
import { ScheduleEvent } from '@/types';
import ScheduleEventComponent from './ScheduleEvent';

interface DayViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
}

const DayView: React.FC<DayViewProps> = ({ events, currentDate }) => {
  // Get day of week as number (0-6, where 0 is Sunday)
  const dayOfWeek = currentDate.getDay();
  
  // Filter events for the current day
  const dayEvents = events.filter(event => event.day === dayOfWeek);

  return (
    <div className="border rounded-lg">
      <div className="bg-gray-100 p-3 text-center rounded-t-lg">
        <div className="font-medium">{format(currentDate, 'EEEE')}</div>
        <div className="text-2xl font-bold">{format(currentDate, 'd')}</div>
      </div>
      <div className="p-4 min-h-[300px]">
        {dayEvents.length > 0 ? (
          dayEvents.map(event => (
            <ScheduleEventComponent key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">No classes</div>
        )}
      </div>
    </div>
  );
};

export default DayView;
