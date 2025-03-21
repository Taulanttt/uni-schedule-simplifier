
import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths, 
  subMonths 
} from 'date-fns';
import { ScheduleEvent } from '@/types';
import ScheduleEventComponent from './ScheduleEvent';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonthViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  events, 
  currentDate,
  setCurrentDate
}) => {
  const isMobile = useIsMobile();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Week starts on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const today = new Date();

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const rows = [];
  let days = [];
  let day = startDate;

  // Header with navigation
  const header = (
    <div className="flex justify-between items-center mb-4">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  // Create days of week header
  const daysOfWeek = isMobile ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayHeaders = daysOfWeek.map((day, index) => (
    <div key={index} className="p-1 md:p-2 text-center font-medium text-xs md:text-sm">
      {day}
    </div>
  ));

  // Create weeks
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);
      const dayOfWeek = day.getDay();
      
      // Map Sunday (0) to 6 for our array index (so Monday is 0, etc.)
      const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      // Filter events for this day
      const dayEvents = events.filter(event => event.day === dayOfWeek);
      
      days.push(
        <div
          key={day.toString()}
          className={cn(
            'border p-1 md:p-2 min-h-[60px] md:min-h-[100px] hover:bg-gray-50 transition-colors',
            !isSameMonth(day, monthStart) ? 'bg-gray-100 text-gray-400' : '',
            isSameDay(day, today) ? 'bg-blue-50 border-blue-200' : ''
          )}
        >
          <div className="text-right mb-1 font-medium text-xs md:text-sm">
            {format(day, 'd')}
          </div>
          <div className="space-y-1 max-h-[45px] md:max-h-[80px] overflow-y-auto">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <ScheduleEventComponent key={event.id} event={event} />
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center">No exams</div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-0">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="rounded-lg overflow-hidden">
      {header}
      <div className="grid grid-cols-7 gap-0 bg-gray-50 border-t border-l">
        {dayHeaders}
      </div>
      <div className="border-l border-r">{rows}</div>
    </div>
  );
};

export default MonthView;
