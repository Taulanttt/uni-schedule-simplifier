// components/WeekView.tsx
import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ScheduleItem } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";

interface WeekViewProps {
  events: ScheduleItem[];
  currentDate: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    const dayStr = format(date, "EEEE"); // "Monday", "Tuesday"
    const dayNameShort = format(date, "EEE"); // "Mon", "Tue"
    const dayEvents = events.filter((event) =>
      event.daysOfWeek?.includes(dayStr)
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
          <div className="p-2 min-h-[200px] max-h-[500px] overflow-y-auto">
            {day.events.length > 0 ? (
              day.events.map((event) => (
                <ScheduleEventComponent key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-8">No exams</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;
