/* pages/Index.tsx */
import React, { useEffect, useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import WeekView from "@/components/WeekView";
import DayView from "@/components/DayView";
import LegendComponent from "@/components/LegendComponent";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* -------------------------------------------------- */
/* local helpers & extended type                      */
/* -------------------------------------------------- */
interface ScheduleItem {
  id: string;
  eventType: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  academicYear: string | null;
  studyYear: number;
  subjectName: string | null;
  instructorName: string | null;
  semesterName: string | null;
  locationName: string | null;
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
  academicYearId: string;
  createdAt?: string;
  updatedAt?: string;
}

/* “Ligjerata” ➜ “Ligjërata”, etj.  */
const prettifyType = (t = ""): string =>
  t.toLowerCase().startsWith("ligj") ? "Ligjërata" :
  t.toLowerCase().startsWith("ush")  ? "Ushtrime"  :
  t;

/* -------------------------------------------------- */
/* component                                          */
/* -------------------------------------------------- */
const Index: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("week");

  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "2024/25",
    semester: "Veror",
    yearOfStudy: "Viti 1",
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState("—");

  /* fetch */
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
        setSchedules(res.data);

        const latest = res.data
          .flatMap((s) => [s.updatedAt, s.createdAt])
          .filter(Boolean)
          .map((d) => new Date(d as string))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        if (latest) setLastUpdated(format(latest, "dd.MM.yyyy"));
      } catch (err) {
        console.error("Gabim gjatë marrjes së orareve:", err);
      }
    })();
  }, []);

  /* filter */
  const filtered = schedules.filter((i) => {
    if (
      filters.academicYear !== "All Semesters" &&
      i.academicYear !== filters.academicYear
    )
      return false;
    if (
      filters.semester !== "All Semesters" &&
      i.semesterName !== filters.semester
    )
      return false;
    if (filters.yearOfStudy !== "All Years") {
      const n = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (i.studyYear !== n) return false;
    }
    return true;
  });

  /* -------------------------------------------------- */
  /* PDF                                                */
  /* -------------------------------------------------- */
  const handlePrintPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

    const acad = filters.academicYear || "—";
    const sem = filters.semester || "—";

    /*   DEPARTAMENTI …  |  VITI AKADEMIK 2024/25, SEMESTRI VEROR   */
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `DEPARTAMENTI SHKENCA KOMPJUTERIKE DHE INXHINIERI\nVITI AKADEMIK ${acad}, SEMESTRI ${sem.toUpperCase()}`,
      40,
      40
    );

    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      startY: 80,
      head: [
        [
          "Tipi",
          "Fillimi",
          "Mbarimi",
          "Ditët",
          "Viti",
          "Lënda",
          "Profesori",
          "Salla",
        ],
      ],
      body: filtered.map((i) => [
        prettifyType(i.eventType),
        i.startTime.slice(0, 5),
        i.endTime.slice(0, 5),
        i.daysOfWeek.join(", "),
        i.studyYear,
        i.subjectName ?? "—",
        i.instructorName ?? "—",
        i.locationName ?? "—",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: "#e5e5e5", textColor: "#000" },
    });

    doc.save("Orari.pdf");
  };

  /* -------------------------------------------------- */
  /* render                                             */
  /* -------------------------------------------------- */
  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <FilterPanel filters={filters} setFilters={setFilters} compact />
        <div className="flex space-x-2">
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
          >
            Ditë
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            Javë
          </Button>
          <Button onClick={handlePrintPDF}>Printo PDF</Button>
        </div>
      </div>

      {/* main area */}
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view === "day" ? (
          <DayView
            events={filtered}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
          />
        ) : (
          <WeekView events={filtered} currentDate={currentDate} />
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

export default Index;
