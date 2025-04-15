import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ScheduleItem } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";

// Harta e ditëve anglisht → shqip
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

// Konverton "HH:MM:SS" në minuta për renditje
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  // Fillojmë javën me të hënën (weekStartsOn: 1)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Krijojmë një varg me 7 ditë (E hënë - E diel)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);

    // p.sh. "Monday", "Tuesday"
    const englishDayName = format(date, "EEEE");
    // Ndërsa për shfaqje marrim p.sh. "E hënë"
    const albanianDayName = dayMap[englishDayName] || englishDayName;

    // Filtrimi i event-eve → event.daysOfWeek?.includes("Monday") ...
    let dayEvents = events.filter((event) =>
      event.daysOfWeek?.includes(englishDayName)
    );

    // Rendisim sipas startTime në minuta
    dayEvents = dayEvents.sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );

    return {
      date,
      englishDayName,
      albanianDayName,
      events: dayEvents,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day, index) => (
        <div key={index} className="border rounded-lg">
          <div className="bg-gray-100 p-2 text-center rounded-t-lg">
            <div className="text-lg font-bold">{day.albanianDayName}</div>
          </div>
          <div className="p-2 min-h-[200px]">
            {day.events.length > 0 ? (
              day.events.map((event) => (
                <ScheduleEventComponent key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-8">
                Asnjë ngjarje
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;
