
import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ScheduleHeaderProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  view: 'day' | 'week';
  setView: React.Dispatch<React.SetStateAction<'day' | 'week'>>;
  className?: string;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  currentDate,
  setCurrentDate,
  view,
  setView,
  className = '',
}) => {
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  const dateRangeText = view === 'day' 
    ? format(currentDate, 'd')
    : `${format(start, 'd')} - ${format(end, 'd')}`;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={goToPrevious} size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={goToNext} size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">{dateRangeText}</h2>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant={view === 'day' ? 'default' : 'outline'} 
          onClick={() => setView('day')}
        >
          Day
        </Button>
        <Button 
          variant={view === 'week' ? 'default' : 'outline'} 
          onClick={() => setView('week')}
        >
          Week
        </Button>
      </div>
    </div>
  );
};

export default ScheduleHeader;
