
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
        event.type === 'lecture' && 'bg-purple-50 border-purple-200 text-purple-700',
        event.type === 'lab' && 'bg-green-50 border-green-200 text-green-700',
        event.type === 'office' && 'bg-blue-50 border-blue-200 text-blue-700'
      )}
    >
      <div className="font-semibold">{event.title}</div>
      <div className="text-xs mt-1">{event.time}</div>
      <div className="text-xs mt-1">{event.location}</div>
    </div>
  );
};

export default ScheduleEvent;
