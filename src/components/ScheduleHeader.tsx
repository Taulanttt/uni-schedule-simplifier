
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface ScheduleHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: 'day' | 'week' | 'month';
  setView: (view: 'day' | 'week' | 'month') => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  currentDate,
  setCurrentDate,
  view,
  setView,
}) => {
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  const dateRangeText = view === 'day' 
    ? format(currentDate, 'MMMM d, yyyy')
    : view === 'week'
    ? `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
    : format(currentDate, 'MMMM yyyy');

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={goToPrevious} size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={goToToday}>
          Today
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
        <Button 
          variant={view === 'month' ? 'default' : 'outline'} 
          onClick={() => setView('month')}
        >
          Month
        </Button>
      </div>
    </div>
  );
};

export default ScheduleHeader;
