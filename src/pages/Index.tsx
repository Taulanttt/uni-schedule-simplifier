
import React, { useState } from 'react';
import FilterPanel from '@/components/FilterPanel';
import ScheduleHeader from '@/components/ScheduleHeader';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import MonthView from '@/components/MonthView';
import LegendComponent from '@/components/LegendComponent';
import { scheduleData, getFilteredSchedule } from '@/data/scheduleData';
import { FilterOptions } from '@/types';

const Index: React.FC = () => {
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
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Lectures Schedule</h1>
      
      <FilterPanel filters={filters} setFilters={setFilters} />
      
      <ScheduleHeader
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />
      
      <div className="bg-white rounded-lg shadow p-4">
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

export default Index;
