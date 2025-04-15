import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ExamItem } from "@/pages/Exams"; // ose nga "@/types"
import ScheduleEventComponentExams from "./ScheduleEventComponentExams";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/*
 * Funksion që kthen "September 2025" → "Shtator 2025"
 */
function getMuajiNeShqip(date: Date): string {
  const monthMap: Record<string, string> = {
    January: "Janar",
    February: "Shkurt",
    March: "Mars",
    April: "Prill",
    May: "Maj",
    June: "Qershor",
    July: "Korrik",
    August: "Gusht",
    September: "Shtator",
    October: "Tetor",
    November: "Nëntor",
    December: "Dhjetor",
  };

  const englishMonth = format(date, "MMMM");
  const year = format(date, "yyyy");
  const albanianMonth = monthMap[englishMonth] || englishMonth;
  return `${albanianMonth} ${year}`;
}

// Props për MonthView
interface MonthViewProps {
  events: ExamItem[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const MonthView: React.FC<MonthViewProps> = ({
  events,
  currentDate,
  setCurrentDate,
}) => {
  const isMobile = useIsMobile();

  // Kufijtë e muajit
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const sot = new Date();

  // Navigimi mujor
  const shkoMuajinPara = () => setCurrentDate(subMonths(currentDate, 1));
  const shkoMuajinPas = () => setCurrentDate(addMonths(currentDate, 1));

  // Koka e kalendarit: Butonat e majtas/djathtas + Muaji + Viti (në shqip)
  const header = (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="icon" onClick={shkoMuajinPara}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-lg md:text-xl font-semibold text-center flex-1">
        {getMuajiNeShqip(currentDate)}
      </div>

      <Button variant="outline" size="icon" onClick={shkoMuajinPas}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  // Ditët e javës
  const daysOfWeek = isMobile
    ? ["H", "M", "M", "E", "P", "Sh", "D"]
    : ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"];

  const dayHeaders = daysOfWeek.map((day, index) => (
    <div
      key={index}
      className="p-1 md:p-2 text-center font-medium text-xs md:text-sm text-muted-foreground"
    >
      {day}
    </div>
  ));

  // Ndërtojmë kalendarin rresht pas rreshti
  let dita = startDate;
  const vargRreshtash: JSX.Element[] = [];
  let vargDitësh: JSX.Element[] = [];

  while (dita <= endDate) {
    for (let i = 0; i < 7; i++) {
      const ditaKopje = new Date(dita);

      // Filtrimi i provimeve për këtë datë
      const dayEvents = events.filter((event) =>
        isSameDay(dita, parseISO(event.date))
      );

      vargDitësh.push(
        <div
          key={ditaKopje.toString()}
          className={cn(
            "border p-1 md:p-2 min-h-[60px] md:min-h-[100px] transition-colors rounded-md",
            !isSameMonth(dita, monthStart)
              ? "bg-gray-100 text-gray-400"
              : "bg-white",
            isSameDay(dita, sot) ? "bg-blue-50 border-blue-300" : "",
            "hover:bg-muted/10"
          )}
        >
          <div className="text-right mb-1 font-medium text-xs md:text-sm">
            {format(dita, "d")}
          </div>

          <div className="space-y-1">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <ScheduleEventComponentExams key={event.id} event={event} />
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center">
                S’ka provime
              </div>
            )}
          </div>
        </div>
      );

      dita = addDays(dita, 1);
    }

    vargRreshtash.push(
      <div key={dita.toString()} className="grid grid-cols-7 gap-2 md:gap-4">
        {vargDitësh}
      </div>
    );
    vargDitësh = [];
  }

  return (
    <div className="rounded-xl bg-white p-2 md:p-4 shadow-sm overflow-x-auto">
      <div className="min-w-[600px]">
        {header}

        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
          {dayHeaders}
        </div>

        <div className="space-y-2">{vargRreshtash}</div>
      </div>
    </div>
  );
};

export default MonthView;
