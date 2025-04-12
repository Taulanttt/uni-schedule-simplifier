import React, { useState, useEffect } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, addWeeks, subWeeks } from "date-fns";
import axiosInstance from "@/utils/axiosInstance";

/*
  1) Harta e emrave të afateve (muajve) me indekset e tyre (0-based).
     p.sh. Janar => 0, Shkurt => 1, ... Shtator => 8, Tetor => 9, etj.
*/
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

/*
  2) Funksion për ndarjen e vitit akademik "2023/24" në [startYear, endYear].
     Mirëpo, tanimë viti akademik fillon më 1 tetor -> 25 shtator.
     - startYear (p.sh. 2023)
     - endYear   (p.sh. 2024)
*/
function parseAcademicYear(ay: string): [number, number] {
  const [startStr, endStr] = ay.split("/");
  const startYear = parseInt(startStr, 10);
  const endYear = parseInt(endStr, 10) + 2000;
  return [startYear, endYear];
}

// 3) Formati i një provimi
export interface ExamItem {
  id: string;
  eventType: string;
  academicYear: string;
  studyYear: number;
  date: string;
  hour: string;
  afatiId: string;
  subjectId: string;
  instructorId: string;

  Afati?: {
    id: string;
    name: string;
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

// 4) Struktura e filtrit
interface FilterOptionsexam {
  academicYear: string;
  afati: string;
  yearOfStudy: string;
}

// 5) Filtrimi i provimeve
function getFilteredExams(
  data: ExamItem[],
  academicYear: string,
  afati: string,
  yearOfStudy: string
): ExamItem[] {
  return data.filter((exam) => {
    // Filtrim sipas vitit akademik
    if (academicYear !== "All Years" && exam.academicYear !== academicYear) {
      return false;
    }
    // Filtrim sipas afatit
    if (afati !== "All Afati") {
      if (exam.Afati?.name !== afati) {
        return false;
      }
    }
    // Filtrim sipas vitit të studimeve
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

  // 6) Gjendja e filtrit
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "Shkurt",  
    yearOfStudy: "Viti 1",
  });

  // 7) Lista e provimeve
  const [exams, setExams] = useState<ExamItem[]>([]);

  // Jemi në mobile apo jo
  const isMobile = useIsMobile();

  // 8) Marrim provimet në montim
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
    9) Logjika e vendosjes së datës sipas faktit:
       - Viti akademik nis më 1 tetor (muaji 9) i startYear
         dhe mbaron më 25 shtator (muaji 8) i endYear.

       Prandaj:
         NËSE monthIndex >= 9 => viti = startYear + 1 tetor ... 
         PËRNDYSHE => viti = endYear

       Por kërkesa juaj thotë:
       "nëse p.sh. 2024/25 dhe afati Shtator (8) -> shtator 2025"
       => do të thotë se, sapo monthIndex=8 => viti = endYear
       => nëse monthIndex >= 9 (tetor, nentor, dhjetor) => viti = startYear
       KJO i përshtatet 1 tetor => startYear, e cila vazhdon deri 25 shtator => endYear

       Pra:
         if (monthIndex >= 9) => chosenYear = startYear
         else => chosenYear = endYear
  */
  useEffect(() => {
    const monthIndex = afatiMonthMap[filters.afati];
    if (monthIndex !== undefined && filters.academicYear !== "All Years") {
      const [startYear, endYear] = parseAcademicYear(filters.academicYear);

      // sipas kërkesës suaj: 
      //  - Tetor(9)..Dhjetor(11) => viti = startYear
      //  - Janar(0)..Shtator(8) => viti = endYear
      let chosenYear = endYear;
      if (monthIndex >= 9) {
        chosenYear = startYear;
      }

      setCurrentDate(new Date(chosenYear, monthIndex, 1));
    }
  }, [filters.afati, filters.academicYear]);

  // 10) Filtrimi i provimeve
  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.afati,
    filters.yearOfStudy
  );

  // 11) Navigimi javor në celular
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

      {/* Këndi kryesor */}
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

            {/* Pamja javore në celular */}
            <WeekView events={filteredEvents} currentDate={currentDate} />
          </>
        ) : (
          // Pamja mujore në desktop
          <MonthView
            events={filteredEvents}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
      </div>

      {/* Legjenda vetëm në desktop */}
      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
