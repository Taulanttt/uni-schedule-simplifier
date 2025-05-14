/* pages/Exams.tsx */
import React, { useEffect, useState } from "react";
import FilterPanelExams from "@/components/FilterPanelExams";
import MonthView from "@/components/MonthView";
import WeekView from "@/components/weekViewExams";
import LegendComponent from "@/components/LegendComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { addWeeks, subWeeks, format } from "date-fns";
import { sq } from "date-fns/locale";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ---------- month index by Afati ---------- */
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

/* ---------- helpers ---------- */
const parseAcademicYear = (ay: string) => {
  const [s, e] = ay.split("/");
  return [parseInt(s, 10), parseInt(e, 10) + 2000] as [number, number];
};

/* ---------- types ---------- */
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
  AcademicYear?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

interface FilterOptionsexam {
  academicYear: string;
  afati: string;
  yearOfStudy: string;
}

/* ================ component ================= */
const Exams: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "2024/25",
    afati: "Qershor",
    yearOfStudy: "Viti 1",
  });

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState("—");

  /* ------- fetch -------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get<ExamItem[]>("/exams");
        setExams(res.data);

        const latest = res.data
          .flatMap((e) => [e.updatedAt, e.createdAt])
          .filter(Boolean)
          .map((d) => new Date(d as string))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        if (latest) setLastUpdated(format(latest, "dd.MM.yyyy"));
      } catch (err) {
        console.error("Gabim gjatë marrjes së provimeve:", err);
      }
    })();
  }, []);

  /* ------- react to filter change (month) -------- */
  useEffect(() => {
    const idx = afatiMonthMap[filters.afati];
    if (idx !== undefined) {
      const [startY, endY] = parseAcademicYear(filters.academicYear);
      const year = idx >= 9 ? startY : endY;
      setCurrentDate(new Date(year, idx, 1));
    }
  }, [filters.afati, filters.academicYear]);

  /* ------- filter data -------- */
  const filteredEvents = exams.filter((e) => {
    if (e.AcademicYear?.name !== filters.academicYear) return false;
    if (e.Afati?.name !== filters.afati) return false;
    const n = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10) || 1;
    return e.studyYear === n;
  });

  /* ------- PDF -------- */
  const handlePrintPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `DEPARTAMENTI SHKENCA KOMPJUTERIKE DHE INXHINIERI\nVITI AKADEMIK ${filters.academicYear}, AFATI ${filters.afati.toUpperCase()}`,
      40,
      40
    );
    doc.setFont("helvetica", "normal");

    const body = filteredEvents.map((e) => [
      format(new Date(e.date), "dd/MM/yyyy"),
      e.hour.slice(0, 5),
      `Viti ${e.studyYear}`,
      e.Subject?.name ?? "—",
      e.Instructor?.name ?? "—",
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["Data", "Ora", "Viti", "Lënda", "Profesori"]],
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: "#e5e5e5", textColor: "#000" },
    });

    doc.save("Provimet.pdf");
  };

  /* ------- week nav (mobile) -------- */
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  /* ------------------- render ------------------- */
  return (
    <div className="flex flex-col">
      {/* filters */}
      <div
        className={`flex flex-col ${
          isMobile ? "mb-2" : "md:flex-row"
        } items-center justify-center mb-4 gap-2`}
      >
        <FilterPanelExams filters={filters} setFilters={setFilters} compact />
      </div>

      {/* PDF button */}
      <div className="flex justify-center md:justify-end mb-2">
        <Button onClick={handlePrintPDF}>Printo PDF</Button>
      </div>

      {/* main schedule */}
      <div className="bg-white rounded-lg shadow p-2 md:p-4">
        {isMobile ? (
          <>
            <div className="flex items-center justify-center text-lg font-semibold mb-2">
              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={prevWeek}
              >
                &lt;
              </button>
              <div className="mx-4">
                {format(currentDate, "MMMM yyyy", { locale: sq })}
              </div>
              <button
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                onClick={nextWeek}
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

      {/* legend + timestamp */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <LegendComponent />
        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
          Last updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
};

export default Exams;
