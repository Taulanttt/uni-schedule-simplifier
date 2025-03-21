
import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ScheduleEvent } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";

interface WeekViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  // Use "weekStartsOn: 1" so the week begins on Monday
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Create an array of 7 days (Mon-Sun) starting from this "startDate"
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    // dayOfWeekValue: 0=Sunday, 1=Monday, 2=Tuesday, etc.
    const dayOfWeekValue = date.getDay();

    // Filter events that match this day's dayOfWeekValue
    const dayEvents = events.filter((event) => event.day === dayOfWeekValue);

    // e.g. format as "Mon", "Tue", "Wed", ...
    const dayName = format(date, "EEE");

    return { date, dayName, events: dayEvents };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day, index) => (
        <div key={index} className="border rounded-lg">
          <div className="bg-gray-100 p-2 text-center rounded-t-lg">
            <div className="text-lg font-bold">{day.dayName}</div>
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
