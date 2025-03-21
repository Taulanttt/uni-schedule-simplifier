import React from 'react';
import { ScheduleEvent as ScheduleEventType } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScheduleEventProps {
  event: ScheduleEventType;
}

const ScheduleEvent: React.FC<ScheduleEventProps> = ({ event }) => {
  const isMobile = useIsMobile();
  
  // Extract professor name from title if available (assuming format "Subject: Professor")
  const titleParts = event.title.split(':');
  const subject = titleParts[0].trim();
  const professor = titleParts.length > 1 ? titleParts[1].trim() : '';

  if (isMobile) {
    return (
      <div 
        className={cn(
          'schedule-item mb-1 p-1 rounded-md border text-[10px]',
          event.type === 'lecture' && 'bg-purple-50 border-purple-200 text-purple-700',
          event.type === 'lab' && 'bg-green-50 border-green-200 text-green-700',
          event.type === 'office' && 'bg-blue-50 border-blue-200 text-blue-700'
        )}
      >
        <div className="font-semibold truncate">{subject}</div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'schedule-item mb-2 p-2 rounded-md border text-xs',
        event.type === 'lecture' && 'bg-purple-50 border-purple-200 text-purple-700',
        event.type === 'lab' && 'bg-green-50 border-green-200 text-green-700',
        event.type === 'office' && 'bg-blue-50 border-blue-200 text-blue-700'
      )}
    >
      <div className="font-semibold truncate">{subject}</div>
      {professor && <div className="text-xs mt-0.5 font-medium truncate">{professor}</div>}
      <div className="text-xs mt-0.5 flex items-center justify-between">
        <span>{event.time}</span>
        <span className="truncate">{event.location}</span>
      </div>
    </div>
  );
};

export default ScheduleEvent;