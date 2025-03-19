
import React, { useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import ScheduleHeader from '@/components/ScheduleHeader';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import MonthView from '@/components/MonthView';
import LegendComponent from '@/components/LegendComponent';
import { scheduleData, getFilteredSchedule } from '@/data/scheduleData';
import { FilterOptions } from '@/types';

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
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
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Exams Schedule</h1>
          <FilterPanel filters={filters} setFilters={setFilters} compact />
        </div>
        
        <ScheduleHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
          className="mt-1"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view === 'day' && (
          <DayView events={filteredEvents} currentDate={currentDate} />
        )}
        
        {view === 'week' && (
          <WeekView events={filteredEvents} currentDate={currentDate} />
        )}
        
        {view === 'month' && (
          <MonthView events={filteredEvents} currentDate={currentDate} />
        )}
      </div>
      
      <LegendComponent />
    </div>
  );
};

export default Exams;
