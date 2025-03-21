// Exams.tsx

import React, { useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { examsData } from "@/data/examsData";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks, subWeeks } from "date-fns";

interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}

// Filter logic
function getFilteredExams(
  data: typeof examsData,
  academicYear: string,
  semester: string,
  yearOfStudy: string
) {
  return data.filter((exam) => {
    if (academicYear !== "All Years" && exam.academicYear !== academicYear) {
      return false;
    }
    if (semester !== "All Semesters" && exam.semester !== semester) {
      return false;
    }
    if (yearOfStudy !== "All Years" && exam.yearOfStudy !== yearOfStudy) {
      return false;
    }
    return true;
  });
}

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "2024/25",
    semester: "All Semesters",
    yearOfStudy: "All Years",
  });

  const isMobile = useIsMobile();

  // Filter data
  const filteredEvents = getFilteredExams(
    examsData,
    filters.academicYear,
    filters.semester,
    filters.yearOfStudy
  );

  // Handlers to move by one week at a time
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="flex flex-col h-full">
      {/* Filters, centered */}
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanel filters={filters} setFilters={setFilters} compact />
      </div>

      <div className="bg-white rounded-lg shadow p-2 md:p-4 flex-1 overflow-auto">
        {isMobile ? (
          <>
            {/* Heading with clickable arrows to move weeks */}
            <div className="flex items-center justify-center text-lg font-semibold mb-2">
              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={goToPreviousWeek}
              >
                &lt;
              </button>

              <div className="mx-4">
                {format(currentDate, "MMMM yyyy")}
              </div>

              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={goToNextWeek}
              >
                &gt;
              </button>
            </div>

            {/* Mobile: WeekView */}
            <WeekView events={filteredEvents} currentDate={currentDate} />
          </>
        ) : (
          /* Desktop: MonthView */
          <MonthView
            events={filteredEvents}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
      </div>

      {/* Legend only on desktop */}
      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
