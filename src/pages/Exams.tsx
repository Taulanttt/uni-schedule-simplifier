
import React, { useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import MonthView from '@/components/MonthView';
import LegendComponent from '@/components/LegendComponent';
import { scheduleData, getFilteredSchedule } from '@/data/scheduleData';
import { FilterOptions } from '@/types';
import { format } from 'date-fns';

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: '2024/25',
    semester: 'All Semesters',
    yearOfStudy: 'All Years',
  });

  const filteredEvents = getFilteredSchedule(
    scheduleData,
    filters.academicYear,
    filters.semester,
    filters.yearOfStudy
  );

  return (
    <div className="flex flex-col h-full">
      {/* Filters at the top with compact layout like Index page */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <FilterPanel filters={filters} setFilters={setFilters} compact />
      </div>
      
      <div className="text-xl font-semibold text-center mb-4">
        {format(currentDate, 'MMMM yyyy')}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        <MonthView 
          events={filteredEvents} 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
      
      <LegendComponent />
    </div>
  );
};

export default Exams;
