
import React, { useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import MonthView from '@/components/MonthView';
import LegendComponent from '@/components/LegendComponent';
import { scheduleData, getFilteredSchedule } from '@/data/scheduleData';
import { FilterOptions } from '@/types';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: '2024/25',
    semester: 'All Semesters',
    yearOfStudy: 'All Years',
  });
  const isMobile = useIsMobile();

  const filteredEvents = getFilteredSchedule(
    scheduleData,
    filters.academicYear,
    filters.semester,
    filters.yearOfStudy
  );

  return (
    <div className="flex flex-col h-full">
      {/* Filters at the top with compact layout like Index page */}
      <div className={`flex flex-col ${isMobile ? 'mb-2' : 'md:flex-row'} items-center justify-between mb-4 gap-2`}>
        <FilterPanel filters={filters} setFilters={setFilters} compact />
      </div>
      
      <div className="text-lg md:text-xl font-semibold text-center mb-2 md:mb-4">
        {format(currentDate, 'MMMM yyyy')}
      </div>
      
      <div className="bg-white rounded-lg shadow p-2 md:p-4 flex-1 overflow-auto">
        <MonthView 
          events={filteredEvents} 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
      
      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
