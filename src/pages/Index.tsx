/* pages/Index.tsx -------------------------------------------------- */
import React, { useEffect, useMemo, useState } from "react";
import FilterPanel      from "@/components/FilterPanelIndex";
import WeekView         from "@/components/WeekView";
import DayView          from "@/components/DayView";
import LegendComponent  from "@/components/LegendComponent";
import { Button }       from "@/components/ui/button";
import axios            from "@/utils/axiosInstance";
import { format }       from "date-fns";
import type { FilterOptions } from "@/types";

/* …  ——  types & helpers si më parë …  */
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
  /* ids (kept for type safety) */
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
  academicYearId: string;
  /* status & timestamps */
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
}

/* “Ligjerata” → “Ligjërata”, etc. */
const prettifyType = (t = "") =>
  t.toLowerCase().startsWith("ligj") ? "Ligjërata"
: t.toLowerCase().startsWith("ush")  ? "Ushtrime"
: t;


/* -------------------------------------------------- */
const Index: React.FC = () => {
  /* state -------------------------------------------------------- */
  const [now , setNow]  = useState(new Date());
  const [view, setView] = useState<"day"|"week">("week");

  const [filters,  setFilters]  = useState<FilterOptions>({
    academicYear : "2024/25",
    semester     : "Veror",
    yearOfStudy  : "Viti 1",
  });

  const [rows,    setRows]    = useState<ScheduleItem[]>([]);
  const [latest , setLatest ] = useState("—");
  const [loading, setLoading] = useState(true);

  /* fetch – vetëm published -------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<ScheduleItem[]>("/schedules/published");
        setRows(data);                                    // ❗ të gatshme për t’u shfaqur

        /* updated-at për footer */
        const last = data
          .flatMap(r => [r.updatedAt, r.createdAt])
          .filter(Boolean)
          .map(d => new Date(d!))
          .sort((a,b) => b.getTime()-a.getTime())[0];

        if (last) setLatest(format(last, "dd.MM.yyyy"));
      } catch (e) {
        console.error("Gabim gjatë marrjes së orarit:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* lista që do të shfaqet (memo → mos llogaritet në çdo render) */
  const visible = useMemo(
    () =>
      rows.filter(r => {
        if (filters.academicYear !== "All Semesters" &&
            r.academicYear      !== filters.academicYear) return false;
        if (filters.semester !== "All Semesters" &&
            r.semesterName   !== filters.semester)        return false;
        if (filters.yearOfStudy !== "All Years") {
          const yr = parseInt(filters.yearOfStudy.replace(/\D/g,""),10);
          if (r.studyYear !== yr)                         return false;
        }
        return true;
      }),
    [rows, filters]
  );

  /* -------------------------------------------------- */
  /* PDF – dynamic import                               */
  /* -------------------------------------------------- */
  const handlePDF = async () => {
    if (!visible.length) return;

    /* ngarko libraritë vetëm kur duhen */
    const [{ jsPDF }, autoTable] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable").then(m => m.default),
    ]);

    const doc = new jsPDF({ orientation:"portrait", unit:"pt", format:"A4" });
    doc.setFont("helvetica","bold").setFontSize(14);
    doc.text(
      `DEPARTAMENTI SHKENCA KOMPJUTERIKE DHE INXHINIERI\n` +
      `VITI AKADEMIK ${filters.academicYear}, SEMESTRI ${filters.semester.toUpperCase()}`,
      40, 40
    );
    doc.setFont("helvetica","normal");

    autoTable(doc,{
      startY:80,
      head:[["Tipi","Fillimi","Mbarimi","Ditët","Viti","Lënda","Profesori","Salla"]],
      body:visible.map(r => [
        prettifyType(r.eventType),
        r.startTime.slice(0,5),
        r.endTime.slice(0,5),
        r.daysOfWeek.join(", "),
        r.studyYear,
        r.subjectName    ?? "—",
        r.instructorName ?? "—",
        r.locationName   ?? "—",
      ]),
      styles:     { fontSize:10 },
      headStyles: { fillColor:"#e5e5e5", textColor:"#000" },
    });

    doc.save("Orari.pdf");
  };

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Duke ngarkuar orarin…</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-lg font-semibold">
          Ende nuk ka orar të publikuar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header --------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <FilterPanel filters={filters} setFilters={setFilters} compact />
        <div className="flex space-x-2">
          <Button
            variant={view==="day" ? "default":"outline"}
            onClick={()=>setView("day")}
          >
            Ditë
          </Button>
          <Button
            variant={view==="week" ? "default":"outline"}
            onClick={()=>setView("week")}
          >
            Javë
          </Button>
          <Button onClick={handlePDF}>Printo PDF</Button>
        </div>
      </div>

      {/* Main ----------------------------------------------------- */}
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view==="day" ? (
          <DayView
            events={visible}
            currentDate={now}
            setCurrentDate={setNow}
            view={view}
            setView={setView}
          />
        ) : (
          <WeekView events={visible} currentDate={now}/>
        )}
      </div>

      {/* Footer --------------------------------------------------- */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <LegendComponent/>
        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
          Last updated: {latest}
        </p>
      </div>
    </div>
  );
};

export default Index;
