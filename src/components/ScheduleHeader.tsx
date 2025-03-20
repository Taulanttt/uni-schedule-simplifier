import React from 'react';
import { format } from 'date-fns';
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

  // Don't display date numbers in the header, keep it simple
  const dateRangeText = view === 'day' 
    ? format(currentDate, 'EEEE') // Show only the day name
    : 'Week View'; // Just show "Week View" instead of date range

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <Button variant="outline" onClick={goToPrevious} size="icon">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-xl font-bold">{dateRangeText}</h2>
      <Button variant="outline" onClick={goToNext} size="icon">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ScheduleHeader;
