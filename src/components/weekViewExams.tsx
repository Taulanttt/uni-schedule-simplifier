import React from "react";
import {
  format,
  addDays,
  startOfWeek,
  parseISO,
  isSameDay,
} from "date-fns";
import { ExamItem } from "@/pages/Exams";
import ScheduleEventComponentExams from "./ScheduleEventComponentExams";

interface WeekViewProps {
  events: ExamItem[];
  currentDate: Date;
}

/**
 * Mobile-friendly: 1 column per day stacked
 */
const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  // Start the week on Monday
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Create an array of 7 days (Mon-Sun)
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    // Filter events matching this exact date
    const dayEvents = events.filter((event) =>
      isSameDay(date, parseISO(event.date))
    );
    // e.g. "Mon 24"
    const dayLabel = format(date, "EEE dd");

    return { date, dayLabel, events: dayEvents };
  });

  return (
    <div className="grid grid-cols-1 gap-4">
      {days.map((dayInfo, index) => (
        <div key={index} className="border rounded-lg flex flex-col">
          <div className="bg-gray-100 p-2 text-center rounded-t-lg">
            <div className="text-lg font-bold">{dayInfo.dayLabel}</div>
          </div>
          {/* Remove or modify overflow-y-auto if you don't want a scroll */}
          <div className="p-2">
            {dayInfo.events.length > 0 ? (
              dayInfo.events.map((event) => (
                <ScheduleEventComponentExams key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center text-gray-400 mt-2">No exams</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;
