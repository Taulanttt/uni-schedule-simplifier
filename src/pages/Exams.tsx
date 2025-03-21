// Exams.tsx

import React, { useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import MonthView from "@/components/MonthView";
import LegendComponent from "@/components/LegendComponent";
import { examsData } from "@/data/examsData";
import { useIsMobile } from "@/hooks/use-mobile";

// You can remove this if you're already importing FilterOptions from "@/types"
interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}

// Helper to filter exams by academic year, semester, and year of study
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

  const filteredEvents = getFilteredExams(
    examsData,
    filters.academicYear,
    filters.semester,
    filters.yearOfStudy
  );

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanel filters={filters} setFilters={setFilters} compact />
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
