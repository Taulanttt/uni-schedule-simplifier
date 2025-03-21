
import React, { useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import ScheduleHeader from '@/components/ScheduleHeader';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import LegendComponent from '@/components/LegendComponent';
import { scheduleData, getFilteredSchedule } from '@/data/scheduleData';
import { FilterOptions } from '@/types';

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
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
      <h1 className="text-2xl font-bold text-center my-4">Exams Schedule</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>
      
      <div className="mb-4 flex justify-center">
        <ScheduleHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view === 'day' && (
          <DayView 
            events={filteredEvents} 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
          />
        )}
        
        {view === 'week' && (
          <WeekView events={filteredEvents} currentDate={currentDate} />
        )}
      </div>
      
      <LegendComponent />
    </div>
  );
};

export default Exams;
