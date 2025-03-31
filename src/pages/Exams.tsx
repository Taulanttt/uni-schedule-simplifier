// Exams.tsx

import React, { useState, useEffect } from "react";
import FilterPanel from "@/components/FilterPanel";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks, subWeeks } from "date-fns";
import axiosInstance from "@/utils/axiosInstance";

// The shape of each exam returned from backend (GET /exams)
export interface ExamItem {
  id: string;
  eventType: string;     // e.g. "exam"
  academicYear: string;  // e.g. "2024/25"
  studyYear: number;     // e.g. 2
  date: string;          // e.g. "2025-02-15"
  hour: string;          // e.g. "10:00:00"
  afati: string;         // e.g. "February"
  subjectId: string;     // foreign key
  instructorId: string;  // foreign key
  Subject?: {
    id: string;
    name: string;
  };
  Instructor?: {
    id: string;
    name: string;
  };
}

interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}

// Filter logic
function getFilteredExams(
  data: ExamItem[],
  academicYear: string,
  semester: string,
  yearOfStudy: string
): ExamItem[] {
  return data.filter((exam) => {
    // Filter by academicYear
    if (academicYear !== "All Years" && exam.academicYear !== academicYear) {
      return false;
    }

    // If your real data doesn't have 'exam.semester', skip or remove this filter
    // if (semester !== "All Semesters" && exam.semester !== semester) {
    //   return false;
    // }

    // Filter by studyYear
    if (yearOfStudy !== "All Years") {
      const numericYear = parseInt(yearOfStudy.replace(/\D/g, ""), 10) || 0;
      if (exam.studyYear !== numericYear) {
        return false;
      }
    }

    return true;
  });
}

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "2024/25",
    semester: "All Semesters",
    yearOfStudy: "All Years",
  });

  // The array of exams from your API
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Detect mobile
  const isMobile = useIsMobile();

  // 1) Fetch from backend on mount
  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await axiosInstance.get<ExamItem[]>("/exams");
        setExams(res.data);
      } catch (error) {
        console.error("Error fetching exam schedules:", error);
      }
    }
    fetchExams();
  }, []);

  // 2) Filter data
  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.semester, // not actually used in filtering
    filters.yearOfStudy
  );

  // Handlers to move by one week at a time
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="flex flex-col h-full">
      {/* Filters at the top */}
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanel filters={filters} setFilters={setFilters} compact />
      </div>

      {/* Main exam area */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4 flex-1 overflow-auto">
        {/* On mobile → show weekly view; On desktop → show monthly view */}
        {isMobile ? (
          <>
            {/* Weekly arrows + label */}
            <div className="flex items-center justify-center text-lg font-semibold mb-2">
              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={goToPreviousWeek}
              >
                &lt;
              </button>

              <div className="mx-4">{format(currentDate, "MMMM yyyy")}</div>

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
          // Desktop: MonthView
          <MonthView
            events={filteredEvents}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
      </div>

      {/* Legend on desktop only */}
      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
