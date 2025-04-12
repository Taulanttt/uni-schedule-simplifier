// components/DayView.tsx

import React from "react";
import { format, addDays, subDays } from "date-fns";
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

const DayView: React.FC<DayViewProps> = ({
  events,
  currentDate,
  setCurrentDate,
}) => {
  // Filter events that match this weekday
  const currentDayStr = format(currentDate, "EEEE"); // e.g. "Monday"
  let dayEvents = events.filter((event) =>
    event.daysOfWeek?.includes(currentDayStr)
  );

  // Sort by startTime ascending
  dayEvents = dayEvents.sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  // Handlers for going to previous/next day
  const goToPreviousDay = () => {
    setCurrentDate((prevDate) => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 1));
  };

  return (
    <div className="space-y-4">
      {/* Header with previous/next buttons and current day in the center */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousDay}
          className="border rounded p-2" // Example styling if not using <Button> component
        >
          {/* If using lucide-react: <ChevronLeft className="h-4 w-4" /> */}
          &lt;
        </button>

        <div className="text-lg md:text-xl font-semibold text-center flex-1">
          {format(currentDate, "EEEE")}
        </div>

        <button
          onClick={goToNextDay}
          className="border rounded p-2" // Example styling if not using <Button> component
        >
          {/* If using lucide-react: <ChevronRight className="h-4 w-4" /> */}
          &gt;
        </button>
      </div>

      {/* List of scheduled events for this day */}
      <div className="p-4 min-h-[300px] border rounded-lg">
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
