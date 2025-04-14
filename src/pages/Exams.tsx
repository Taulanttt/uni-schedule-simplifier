import React, { useState, useEffect } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks, subWeeks } from "date-fns";
import axiosInstance from "@/utils/axiosInstance";

// 1) Mappimi i emrave të afatit (muajve)
const afatiMonthMap: Record<string, number> = {
  Janar: 0,
  Shkurt: 1,
  Mars: 2,
  Prill: 3,
  Maj: 4,
  Qershor: 5,
  Korrik: 6,
  Gusht: 7,
  Shtator: 8,
  Tetor: 9,
  Nentor: 10,
  Dhjetor: 11,
};

// 2) parseAcademicYear
function parseAcademicYear(ay: string): [number, number] {
  const [startStr, endStr] = ay.split("/");
  const startYear = parseInt(startStr, 10);
  const endYear = parseInt(endStr, 10) + 2000;
  return [startYear, endYear];
}

// 3) Struktura e ExamItem
export interface ExamItem {
  id: string;
  eventType: string;
  studyYear: number;
  date: string; // p.sh. "2025-09-09"
  hour: string; // "HH:MM:SS"
  afatiId: string;
  subjectId: string;
  instructorId: string;

  Afati?: { id: string; name: string };
  Subject?: { id: string; name: string };
  Instructor?: { id: string; name: string };
  // AcademicYear pritet nga serveri -> exam.AcademicYear?.name
  AcademicYear?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

// 4) Filtrat
interface FilterOptionsexam {
  academicYear: string;  // p.sh. "2024/25"
  afati: string;         // p.sh. "Shtator"
  yearOfStudy: string;   // p.sh. "Viti 1"
}

// 5) Filtri
function getFilteredExams(
  data: ExamItem[],
  academicYear: string,
  afati: string,
  yearOfStudy: string
) {
  return data.filter((exam) => {
    // Krahaso me exam.AcademicYear?.name
    if (exam.AcademicYear?.name !== academicYear) {
      return false;
    }
    // Krahaso me exam.Afati?.name
    if (exam.Afati?.name !== afati) {
      return false;
    }
    // Krahaso me exam.studyYear
    const numericYear = parseInt(yearOfStudy.replace(/\D/g, ""), 10) || 1;
    if (exam.studyYear !== numericYear) {
      return false;
    }
    return true;
  });
}

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // 6) Filtrat fillestarë -> DUHET t'i vendosni vlera reale
  // p.sh. "2024/25", "Shtator", "Viti 1"
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "Shtator",
    yearOfStudy: "Viti 1",
  });

  // 7) Lista e provimeve
  const [exams, setExams] = useState<ExamItem[]>([]);
  const isMobile = useIsMobile();

  // 8) Marrim provimet
  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await axiosInstance.get<ExamItem[]>("/exams");
        setExams(res.data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së provimeve:", error);
      }
    }
    fetchExams();
  }, []);

  /*
    9) Kur ndryshon filters.afati ose filters.academicYear,
       vendos currentDate sipas logjikës:
         - parseAcademicYear
         - if monthIndex >= 9 -> chosenYear = startYear
           else chosenYear = endYear
  */
  useEffect(() => {
    const { afati, academicYear } = filters;
    const monthIndex = afatiMonthMap[afati];
    if (monthIndex !== undefined && academicYear) {
      const [startYear, endYear] = parseAcademicYear(academicYear);

      let chosenYear = endYear;
      if (monthIndex >= 9) {
        chosenYear = startYear;
      }
      setCurrentDate(new Date(chosenYear, monthIndex, 1));
    }
  }, [filters.afati, filters.academicYear]);

  // 10) Filtrimi
  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.afati,
    filters.yearOfStudy
  );

  // 11) Lëvizja javor (mobile)
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="flex flex-col">
      {/* Paneli i filtrit */}
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanelExams filters={filters} setFilters={setFilters} compact />
      </div>

      {/* Pamja kryesore */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4">
        {isMobile ? (
          <>
            {/* Shigjetat javore + label */}
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
            <WeekView events={filteredEvents} currentDate={currentDate} />
          </>
        ) : (
          <MonthView
            events={filteredEvents}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
      </div>

      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
