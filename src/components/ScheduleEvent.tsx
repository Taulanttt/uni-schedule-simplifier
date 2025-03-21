
import React from 'react';
import { ScheduleEvent as ScheduleEventType } from '@/types';
import { cn } from '@/lib/utils';

interface ScheduleEventProps {
  event: ScheduleEventType;
}

const ScheduleEvent: React.FC<ScheduleEventProps> = ({ event }) => {
  // Extract professor name from title if available (assuming format "Subject: Professor")
  const titleParts = event.title.split(':');
  const subject = titleParts[0].trim();
  const professor = titleParts.length > 1 ? titleParts[1].trim() : '';

  return (
    <div 
      className={cn(
        'schedule-item mb-2 p-3 rounded-md border',
        event.type === 'lecture' && 'bg-purple-50 border-purple-200 text-purple-700',
        event.type === 'lab' && 'bg-green-50 border-green-200 text-green-700',
        event.type === 'office' && 'bg-blue-50 border-blue-200 text-blue-700'
      )}
    >
      <div className="font-semibold">{subject}</div>
      {professor && <div className="text-sm mt-1 font-medium">{professor}</div>}
      <div className="text-xs mt-1 flex items-center justify-between">
        <span>{event.time}</span>
        <span>{event.location}</span>
      </div>
    </div>
  );
};

export default ScheduleEvent;
