import React, { useState, useEffect } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks, subWeeks } from "date-fns";
import axiosInstance from "@/utils/axiosInstance";

export interface ExamItem {
  id: string;
  eventType: string;    // e.g. "Provime"
  academicYear: string; // "2024/25"
  studyYear: number;    // 2
  date: string;         // "2025-02-15"
  hour: string;         // "10:00:00"
  afatiId: string;      // foreign key
  subjectId: string;
  instructorId: string;

  Afati?: {
    id: string;
    name: string; // e.g. "February", "June"
  };
  Subject?: {
    id: string;
    name: string;
  };
  Instructor?: {
    id: string;
    name: string;
  };
}

// Filter object from FilterPanelExams
interface FilterOptionsexam {
  academicYear: string;
  afati: string;
  yearOfStudy: string;
}

// Filter logic
function getFilteredExams(
  data: ExamItem[],
  academicYear: string,
  afati: string,
  yearOfStudy: string
): ExamItem[] {
  return data.filter((exam) => {
    // By academicYear
    if (academicYear !== "All Years" && exam.academicYear !== academicYear) {
      return false;
    }

    // By Afati name
    if (afati !== "All Afati") {
      if (exam.Afati?.name !== afati) {
        return false;
      }
    }

    // By studyYear
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
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "Janar",
    yearOfStudy: "Year 1",
  });

  // The array of exams from your API
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Detect mobile
  const isMobile = useIsMobile();

  // Fetch from backend on mount
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

  // Filter data
  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.afati,
    filters.yearOfStudy
  );

  // Move by one week
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="flex flex-col">
      {/* Filters at the top */}
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanelExams filters={filters} setFilters={setFilters} compact />
      </div>

      {/* Main exam area */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4">
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
