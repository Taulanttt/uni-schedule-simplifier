/* components/WeekView.tsx */
import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ScheduleItem } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";
import { useIsMobile } from "@/hooks/use-mobile";   // NEW

/* Anglisht → Shqip */
const dayMap: Record<string, string> = {
  Monday: "E hënë",
  Tuesday: "E martë",
  Wednesday: "E mërkurë",
  Thursday: "E enjte",
  Friday: "E premte",
  Saturday: "E shtunë",
  Sunday: "E diel",
};

interface WeekViewProps {
  events: ScheduleItem[];
  currentDate: Date;
}

/* helper: "HH:MM:SS" → total minutes (për renditje) */
const toMinutes = (t?: string) =>
  !t ? 0 : t.split(":").slice(0, 2).map(Number).reduce((h, m, i) => (i ? h + m : h * 60));

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  const isMobile = useIsMobile();

  /* fillojmë javën me të hënën (weekStartsOn = 1) */
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  /* krijojmë vargun e ditëve */
  const allDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    const eng = format(date, "EEEE");          // Monday …
    const alb = dayMap[eng] ?? eng;            // E hënë …

    const dayEvents = events
      .filter((e) => e.daysOfWeek?.includes(eng))
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    return { eng, alb, events: dayEvents };
  });

  /* 📱 Në mobile heqim ditët pa ngjarje */
  const days = isMobile ? allDays.filter((d) => d.events.length > 0) : allDays;

  return (
    <div
      className={
        isMobile
          ? "space-y-4"                       /* një kolonë – vetëm ditët me ngjarje */
          : "grid grid-cols-1 md:grid-cols-7 gap-4" /* 7 kolona në desktop */
      }
    >
      {days.map((day) => (
        <div key={day.eng} className="border rounded-lg">
          <div className="bg-gray-100 p-2 text-center rounded-t-lg">
            <div className="text-lg font-bold">{day.alb}</div>
          </div>

          <div className="p-2 min-h-[200px]">
            {day.events.length ? (
              day.events.map((ev) => (
                <ScheduleEventComponent key={ev.id} event={ev} />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-8">Asnjë ngjarje</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;
