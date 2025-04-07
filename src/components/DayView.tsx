// components/DayView.tsx

import React from "react";
import { format } from "date-fns";
import { ScheduleItem } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";

interface DayViewProps {
  events: ScheduleItem[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  view: "day" | "week";
  setView: React.Dispatch<React.SetStateAction<"day" | "week">>;
}

// Helper to parse "HH:MM:SS" into a comparable integer
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

const DayView: React.FC<DayViewProps> = ({ events, currentDate }) => {
  const currentDayStr = format(currentDate, "EEEE"); // e.g. "Monday"
  
  // Filter events matching this weekday
  let dayEvents = events.filter((event) =>
    event.daysOfWeek?.includes(currentDayStr)
  );

  // Sort by startTime ascending
  dayEvents = dayEvents.sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  return (
    <div className="border rounded-lg">
      <div className="bg-gray-100 p-3 flex justify-center items-center rounded-t-lg">
        <div className="text-xl font-bold">{currentDayStr}</div>
      </div>

      <div className="p-4 min-h-[300px]">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <ScheduleEventComponent key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No events scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
