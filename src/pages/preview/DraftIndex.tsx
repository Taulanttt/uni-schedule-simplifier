/* pages/preview/DraftIndex.tsx ------------------------------------ */
import React, { useEffect, useMemo, useState } from "react";
import FilterPanel     from "@/components/FilterPanel";
import WeekView        from "@/components/WeekView";
import DayView         from "@/components/DayView";
import LegendComponent from "@/components/LegendComponent";
import { Button }      from "@/components/ui/button";
import axios           from "@/utils/axiosInstance";
import { format }      from "date-fns";
import type { FilterOptions } from "@/types";

/* -------------------- types & helpers --------------------------- */
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
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
}

const prettifyType = (t = "") =>
  t.toLowerCase().startsWith("ligj") ? "Ligjërata"
: t.toLowerCase().startsWith("ush")  ? "Ushtrime"
: t;

/* -------------------- component --------------------------------- */
const DraftIndex: React.FC = () => {
  const [now , setNow ] = useState(new Date());
  const [view, setView] = useState<"day"|"week">("week");

  const [filters, setFilters] = useState<FilterOptions>({
    academicYear : "2024/25",
    semester     : "Veror",
    yearOfStudy  : "Viti 1",
  });

  const [rows   , setRows   ] = useState<ScheduleItem[]>([]);
  const [latest , setLatest ] = useState("—");
  const [loading, setLoading] = useState(true);

  /* -------------------- fetch drafts ---------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<ScheduleItem[]>("/schedules?status=draft");
        setRows(data);

        /* vendosim vlerat e para si default në filtra – si në Index */
        if (data.length) {
          setFilters(f => ({
            ...f,
            academicYear : data[0].academicYear  ?? "All Semesters",
            semester     : data[0].semesterName  ?? "All Semesters",
          }));
        }

        const last = data
          .flatMap(r => [r.updatedAt, r.createdAt])
          .filter(Boolean)
          .map(d => new Date(d!))
          .sort((a,b)=>b.getTime()-a.getTime())[0];
        if (last) setLatest(format(last,"dd.MM.yyyy"));
      } catch (e) {
        console.error("Gabim gjatë marrjes së draft-eve:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------------------- list visible ---------------------------- */
  const visible = useMemo(
    () =>
      rows.filter(r => {
        if (filters.academicYear !== "All Semesters" &&
            r.academicYear     !== filters.academicYear) return false;
        if (filters.semester !== "All Semesters" &&
            r.semesterName   !== filters.semester)       return false;
        if (filters.yearOfStudy !== "All Years") {
          const yr = parseInt(filters.yearOfStudy.replace(/\D/g,""),10);
          if (r.studyYear !== yr)                        return false;
        }
        return true;
      }),
    [rows, filters]
  );

  /* -------------------- PDF (opsional) -------------------------- */
  const handlePDF = async () => {
    if (!visible.length) return;

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
      styles:{ fontSize:10 },
      headStyles:{ fillColor:"#e5e5e5", textColor:"#000" },
    });

    doc.save("Draft-Orari.pdf");
  };

  /* -------------------- UI -------------------------------------- */
  if (loading)
    return <div className="flex items-center justify-center h-full">Duke ngarkuar…</div>;

  if (!rows.length)
    return <div className="flex items-center justify-center h-full">S’ka draft-e aktive.</div>;

  /* pages/preview/DraftIndex.tsx – vetëm UI-ja është ndryshuar
   (shkurtesat … nënkuptojnë pjesën e pandryshuar të kodit)         */

return (
    /* ———————————————————————————————————————————————————————
       shto një padding global (p-4) + hapësirë vertikale (space-y-6)
       ——————————————————————————————————————————————————————— */
    <div className="flex flex-col p-4 md:p-6 space-y-6">
  
      {/* header – tani me gap-4 dhe mbështjellje */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <FilterPanel filters={filters} setFilters={setFilters} compact />
  
        <div className="flex gap-2">
          <Button
            variant={view==="day"?"default":"outline"}
            onClick={()=>setView("day")}
          >
            Ditë
          </Button>
          <Button
            variant={view==="week"?"default":"outline"}
            onClick={()=>setView("week")}
          >
            Javë
          </Button>
          <Button onClick={handlePDF}>Printo PDF</Button>
        </div>
      </div>
  
      {/* main – vetëm një klasë h-full për ta shtrirë në lartësi */}
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto h-full">
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
  
      {/* footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <LegendComponent/>
        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
          Last updated:&nbsp;{latest}
        </p>
      </div>
    </div>
  );  
};

export default DraftIndex;
