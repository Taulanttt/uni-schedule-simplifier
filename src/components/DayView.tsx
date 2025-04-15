import React from "react";
import { format, addDays, subDays } from "date-fns";
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

interface DayViewProps {
  events: ScheduleItem[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  view: "day" | "week";
  setView: React.Dispatch<React.SetStateAction<"day" | "week">>;
}

// Kthen "HH:MM:SS" në minuta për t'i renditur sipas fillimit
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

const DayView: React.FC<DayViewProps> = ({
  events,
  currentDate,
  setCurrentDate,
}) => {
  // Marrim ditën në anglisht p.sh. "Monday", "Tuesday"
  const currentDayEnglish = format(currentDate, "EEEE"); 
  // Konvertojmë në shqip për shfaqje
  const currentDayAlbanian = dayMap[currentDayEnglish] || currentDayEnglish;

  // Filtrimi i ngjarjeve → sipas "daysOfWeek" (vlerat nga backend, p.sh. "Monday")
  // Nëse event.daysOfWeek përmban "Monday" dhe currentDayEnglish === "Monday" do të pëputhet
  let dayEvents = events.filter((event) =>
    event.daysOfWeek?.includes(currentDayEnglish)
  );

  // Rendisim sipas orës së fillimit
  dayEvents = dayEvents.sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  // Shko në ditën e mëparshme
  const goToPreviousDay = () => {
    setCurrentDate((prevDate) => subDays(prevDate, 1));
  };

  // Shko në ditën e ardhshme
  const goToNextDay = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 1));
  };

  return (
    <div className="space-y-4">
      {/* Koka me butonat < dhe >, dhe emrin e ditës në qendër */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousDay} className="border rounded p-2">
          &lt;
        </button>

        <div className="text-lg md:text-xl font-semibold text-center flex-1">
          {currentDayAlbanian /* p.sh. "E hënë" */}
        </div>

        <button onClick={goToNextDay} className="border rounded p-2">
          &gt;
        </button>
      </div>

      {/* Lista e ngjarjeve për këtë ditë */}
      <div className="p-4 min-h-[300px] border rounded-lg">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <ScheduleEventComponent key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">
            Asnjë ngjarje e planifikuar
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
