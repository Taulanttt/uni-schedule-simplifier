import React, { useState, useEffect } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { addWeeks, subWeeks, format } from "date-fns";
import { sq } from "date-fns/locale"; // Importimi i lokalizimit shqip
import axiosInstance from "@/utils/axiosInstance";

// Harta e muajve të afatit
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

// parseAcademicYear: p.sh. “2024/25” -> [2024, 2025]
function parseAcademicYear(ay: string): [number, number] {
  const [startStr, endStr] = ay.split("/");
  const startYear = parseInt(startStr, 10);
  const endYear = parseInt(endStr, 10) + 2000;
  return [startYear, endYear];
}

// Struktura e një provimi
export interface ExamItem {
  id: string;
  eventType: string;
  studyYear: number;
  date: string;
  hour: string;
  afatiId: string;
  subjectId: string;
  instructorId: string;
  Afati?: { id: string; name: string };
  Subject?: { id: string; name: string };
  Instructor?: { id: string; name: string };
  AcademicYear?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

// Filtrat
interface FilterOptionsexam {
  academicYear: string;
  afati: string;
  yearOfStudy: string;
}

// Filtrimi i listës së provimeve
function getFilteredExams(
  data: ExamItem[],
  academicYear: string,
  afati: string,
  yearOfStudy: string
) {
  return data.filter((exam) => {
    if (exam.AcademicYear?.name !== academicYear) return false;
    if (exam.Afati?.name !== afati) return false;

    const numericYear = parseInt(yearOfStudy.replace(/\D/g, ""), 10) || 1;
    if (exam.studyYear !== numericYear) return false;

    return true;
  });
}

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filtrat fillestarë
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "Shtator",
    yearOfStudy: "Viti 1",
  });

  // Lista e provimeve
  const [exams, setExams] = useState<ExamItem[]>([]);
  const isMobile = useIsMobile();

  // Marrja e provimeve
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

  // Caktojmë currentDate sipas afatit dhe vitit akademik
  useEffect(() => {
    const { afati, academicYear } = filters;
    const monthIndex = afatiMonthMap[afati];
    if (monthIndex !== undefined && academicYear) {
      const [startYear, endYear] = parseAcademicYear(academicYear);
      let chosenYear = endYear;
      if (monthIndex >= 9) chosenYear = startYear;
      setCurrentDate(new Date(chosenYear, monthIndex, 1));
    }
  }, [filters.afati, filters.academicYear]);

  // Lista e provimeve të filtruar
  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.afati,
    filters.yearOfStudy
  );

  // Për mobile: kalimi javor
  const shkoJavaPara = () => setCurrentDate(subWeeks(currentDate, 1));
  const shkoJavaPas = () => setCurrentDate(addWeeks(currentDate, 1));

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

      {/* Zona kryesore e provimeve */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4">
        {isMobile ? (
          <>
            {/* Butonat e lëvizjes në javë, me titullin në mes: "< Shtator 2025 >" */}
            <div className="flex items-center justify-center text-lg font-semibold mb-2">
              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={shkoJavaPara}
              >
                &lt;
              </button>

              {/* Ky <div> në mes do të shfaq "Shtator 2025" (ose muaji/viti sipas date-fns/locale sq) */}
              <div className="mx-4">
                {/* Përdor date-fns me locale sq për muajin në shqip */}
                {format(currentDate, "MMMM yyyy", { locale: sq })}
              </div>

              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={shkoJavaPas}
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

      {/* Legjenda vetëm kur s’është mobile */}
      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
