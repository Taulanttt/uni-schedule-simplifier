// components/WeekView.tsx

import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ScheduleItem } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";

interface WeekViewProps {
  events: ScheduleItem[];
  currentDate: Date;
}

// Helper to parse "HH:MM:SS" into a comparable integer
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  // Start the week on Monday (weekStartsOn: 1)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Build array of 7 days (Mon-Sun)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    const dayStr = format(date, "EEEE");  // "Monday", "Tuesday"
    const dayNameShort = format(date, "EEE"); // "Mon", "Tue"
    
    // Filter events for the current day
    let dayEvents = events.filter((event) =>
      event.daysOfWeek?.includes(dayStr)
    );

    // Sort events by startTime ascending
    dayEvents = dayEvents.sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );

    return { date, dayStr, dayNameShort, events: dayEvents };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day, index) => (
        <div key={index} className="border rounded-lg">
          <div className="bg-gray-100 p-2 text-center rounded-t-lg">
            <div className="text-lg font-bold">{day.dayNameShort}</div>
          </div>
          <div className="p-2 min-h-[200px]">
            {day.events.length > 0 ? (
              day.events.map((event) => (
                <ScheduleEventComponent key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-8">No events</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;
