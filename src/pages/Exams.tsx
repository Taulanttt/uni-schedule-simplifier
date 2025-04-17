import React, { useState, useEffect } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { addWeeks, subWeeks, format } from "date-fns";
import { sq } from "date-fns/locale";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";

// -------------  PDF  -----------------
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// -------------------------------------

/* ---------- Harta e muajve të afatit ---------- */
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

/* ---------- Ndihmës  ---------- */
function parseAcademicYear(ay: string): [number, number] {
  const [startStr, endStr] = ay.split("/");
  return [parseInt(startStr, 10), parseInt(endStr, 10) + 2000];
}

/* ---------- Tipet ---------- */
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
  AcademicYear?: { id: string; name: string; isActive: boolean };
}

interface FilterOptionsexam {
  academicYear: string;
  afati: string;
  yearOfStudy: string;
}

/* ---------- Filtrimi ---------- */
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
    return exam.studyYear === numericYear;
  });
}

const Exams: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "Shtator",
    yearOfStudy: "Viti 1",
  });
  const [exams, setExams] = useState<ExamItem[]>([]);
  const isMobile = useIsMobile();

  /* --- Marr provimet ------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get<ExamItem[]>("/exams");
        setExams(res.data);
      } catch (e) {
        console.error("Gabim gjatë marrjes së provimeve:", e);
      }
    })();
  }, []);

  /* --- Përditëso currentDate kur ndryshon filtri --- */
  useEffect(() => {
    const { afati, academicYear } = filters;
    const monthIndex = afatiMonthMap[afati];
    if (monthIndex !== undefined) {
      const [startYear, endYear] = parseAcademicYear(academicYear);
      const chosenYear = monthIndex >= 9 ? startYear : endYear;
      setCurrentDate(new Date(chosenYear, monthIndex, 1));
    }
  }, [filters.afati, filters.academicYear]);

  const filteredEvents = getFilteredExams(
    exams,
    filters.academicYear,
    filters.afati,
    filters.yearOfStudy
  );

  /* ---------- PDF ---------- */
  const handlePrintPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

    const title = `Provimet – ${filters.afati} | ${filters.academicYear}`;
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    const body = filteredEvents.map((ex) => [
      format(new Date(ex.date), "dd/MM/yyyy"),
      ex.hour.slice(0, 5),
      `Viti ${ex.studyYear}`,
      ex.Subject?.name || "-",
      ex.Instructor?.name || "-",
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["Data", "Ora", "Viti", "Lënda", "Profesori"]],
      body,
      styles: { fontSize: 10 },
    });

    doc.save("Provimet.pdf");
  };

  /* ---------- Lëvizje javore (mobile) ---------- */
  const shkoJavaPara = () => setCurrentDate(subWeeks(currentDate, 1));
  const shkoJavaPas = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <div className="flex flex-col">
      {/* --- Paneli i filtrave --- */}
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanelExams filters={filters} setFilters={setFilters} compact />
      </div>

      {/* --- Butoni Printo PDF (i dukshëm kudo) --- */}
      <div className="flex justify-end mb-2">
        <Button onClick={handlePrintPDF}>Printo PDF</Button>
      </div>

      {/* --- Zona kryesore --- */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4">
        {isMobile ? (
          <>
            {/* Navigimi javë‑më‑javë + titulli në mes */}
            <div className="flex items-center justify-center text-lg font-semibold mb-2">
              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={shkoJavaPara}
              >
                &lt;
              </button>

              <div className="mx-4">
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

      {/* --- Legjenda (vetëm desktop) --- */}
      {!isMobile && <LegendComponent />}
    </div>
  );
};

export default Exams;
