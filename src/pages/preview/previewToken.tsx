/* ----------------------------- */
/*  pages/preview/[previewToken].tsx  */
/* ----------------------------- */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";      // ← NextJS:  useRouter
import WeekView from "@/components/WeekView";
import DayView  from "@/components/DayView";
import LegendComponent from "@/components/LegendComponent";
import FilterPanel from "@/components/FilterPanel";
import { Button }  from "@/components/ui/button";
import axios       from "@/utils/axiosInstance";
import { format }  from "date-fns";
import { jsPDF }   from "jspdf";
import autoTable   from "jspdf-autotable";
import type { FilterOptions } from "@/types";

/* -------------------------------- */
/* local helpers / types            */
/* -------------------------------- */
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
  /* ids */
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
  academicYearId: string;
  /* timestamps */
  createdAt?: string;
  updatedAt?: string;
}

/* prettier label for PDF table */
const prettifyType = (t = "") =>
  t.toLowerCase().startsWith("ligj") ? "Ligjërata"
  : t.toLowerCase().startsWith("ush")  ? "Ushtrime"
  : t;

/* ------------------------------ */
/* component                       */
/* ------------------------------ */
const PreviewSchedulePage: React.FC = () => {
  /* url param = previewToken */
  const { previewToken } = useParams();          // NextJS: const { previewToken } = useRouter().query;
  const navigate         = useNavigate();        // NextJS: const router = useRouter();

  const [view, setView]  = useState<"day"|"week">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [filters, setFilters] = useState<FilterOptions>({
    academicYear : "—",
    semester     : "—",
    yearOfStudy  : "All Years",
  });

  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState("—");
  const [error, setError]   = useState<string | null>(null);

  /* -------- fetch one draft by token -------- */
  useEffect(() => {
    if (!previewToken) return;

    (async () => {
      try {
        const res = await axios.get(`/schedules/preview/${previewToken}`);
        const { scheduleBundle, meta } = res.data as {
          scheduleBundle: ScheduleItem[];
          meta: { academicYear: string; semester: string };
        };

        if (!scheduleBundle.length) throw new Error("Empty draft");

        /* freeze filters so user can’t mix data */
        setFilters({
          academicYear: meta.academicYear,
          semester    : meta.semester,
          yearOfStudy : "All Years",
        });

        setEvents(scheduleBundle);

        /* compute latest timestamp */
        const latest = scheduleBundle
          .flatMap(s => [s.updatedAt, s.createdAt])
          .filter(Boolean)
          .map(d => new Date(d!))
          .sort((a,b) => b.getTime() - a.getTime())[0];

        if (latest) setLastUpdated(format(latest,"dd.MM.yyyy"));
      } catch (err: any) {
        console.error(err);
        setError("Draft not found – maybe it’s already published?");
        /* when using React-Router you could redirect instead: */
        // navigate("/404");
      }
    })();
  }, [previewToken]);

  /* ---------- derived list (year filter only) ---------- */
  const visible = events.filter(ev => {
    if (filters.yearOfStudy !== "All Years") {
      const num = parseInt(filters.yearOfStudy.replace(/\D/g,""),10);
      return ev.studyYear === num;
    }
    return true;
  });

  /* ---------- pdf ---------- */
  const handlePDF = () => {
    const doc = new jsPDF({ orientation:"portrait", unit:"pt", format:"A4" });
    doc.setFontSize(14).setFont("helvetica","bold");
    doc.text(
      `DEPARTAMENTI SHKENCA KOMPJUTERIKE DHE INXHINIERI\n` +
      `VITI AKADEMIK ${filters.academicYear}, SEMESTRI ${filters.semester.toUpperCase()}`,
      40, 40
    );
    doc.setFont("helvetica","normal");
    autoTable(doc,{
      startY:80,
      head:[["Tipi","Fillimi","Mbarimi","Ditët","Viti","Lënda","Profesori","Salla"]],
      body:visible.map(i => [
        prettifyType(i.eventType),
        i.startTime.slice(0,5),
        i.endTime.slice(0,5),
        i.daysOfWeek.join(", "),
        i.studyYear,
        i.subjectName ?? "—",
        i.instructorName ?? "—",
        i.locationName ?? "—",
      ]),
      styles:{ fontSize:10 },
      headStyles:{ fillColor:"#e5e5e5", textColor:"#000" }
    });
    doc.save("Preview-Orari.pdf");
  };

  /* ---------- ui ---------- */
  if (error) return (
    <div className="max-w-xl mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Draft not found</h1>
      <p className="text-gray-600 mb-6">{error}</p>
      <Button onClick={() => navigate("/")}>Kthehu</Button>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* header – filters are shown but disabled */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          compact
        />
        <div className="flex space-x-2">
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

      {/* main */}
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view==="day" ? (
          <DayView
            events={visible}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
          />
        ) : (
          <WeekView events={visible} currentDate={currentDate}/>
        )}
      </div>

      {/* footer */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <LegendComponent/>
        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
          Last updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
};

export default PreviewSchedulePage;
