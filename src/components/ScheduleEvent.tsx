
import React from 'react';
import { ScheduleEvent as ScheduleEventType } from '@/types';
import { cn } from '@/lib/utils';

interface ScheduleEventProps {
  event: ScheduleEventType;
}

const ScheduleEvent: React.FC<ScheduleEventProps> = ({ event }) => {
  return (
    <div 
      className={cn(
        'schedule-item',
        event.type === 'lecture' && 'schedule-item-lecture',
        event.type === 'lab' && 'schedule-item-lab',
        event.type === 'office' && 'schedule-item-office'
      )}
    >
      <div className="font-semibold text-gray-800">{event.title}</div>
      <div className="text-xs mt-1 text-gray-700">{event.time}</div>
      <div className="text-xs mt-1 text-gray-700">{event.location}</div>
    </div>
  );
};

export default ScheduleEvent;
