import React, { useState, useEffect } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks, subWeeks } from "date-fns";
import axiosInstance from "@/utils/axiosInstance";

// 1) The shape of each exam returned from the backend.
//    Notice we store "afatiId" plus an optional "Afati" object with { id, name }.
export interface ExamItem {
  id: string;
  eventType: string;       // e.g. "exam"
  academicYear: string;    // e.g. "2024/25"
  studyYear: number;       // e.g. 2
  date: string;            // e.g. "2025-02-15"
  hour: string;            // e.g. "10:00:00"
  afatiId: string;         // foreign key
  subjectId: string;
  instructorId: string;

  // The associated "Afati" object from the backend
  Afati?: {
    id: string;
    name: string;  // e.g. "February", "June"
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

// 2) The filter object from your FilterPanelExams
interface FilterOptionsexam {
  academicYear: string; // e.g. "All Years" or "2024/25"
  afati: string;        // e.g. "All Afati" or "February"
  yearOfStudy: string;  // e.g. "All Years" or "Year 2"
}

// 3) Filter logic. We compare exam.Afati?.name to "afati" if it's not "All Afati".
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
      // If exam.Afati exists, we compare .name to the filter
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

  // 4) Filter state with "afati"
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "All Afati",
    yearOfStudy: "All Years",
  });

  // The array of exams from your API
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Detect mobile
  const isMobile = useIsMobile();

  // 5) Fetch from backend on mount
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

  // 6) Filter data
  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.afati,
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
        <FilterPanelExams filters={filters} setFilters={setFilters} compact />
      </div>

      {/* Main exam area */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4 flex-1 overflow-auto">
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
