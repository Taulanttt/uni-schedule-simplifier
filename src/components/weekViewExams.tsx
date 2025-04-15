import React from "react";
import {
  format,
  addDays,
  startOfWeek,
  parseISO,
  isSameDay,
  endOfWeek,
} from "date-fns";
import { sq } from "date-fns/locale";
import { ExamItem } from "@/pages/Exams";
import ScheduleEventComponentExams from "./ScheduleEventComponentExams";

interface WeekViewProps {
  events: ExamItem[];
  currentDate: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ events, currentDate }) => {
  // Fillon me të hënën
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Titulli i javës, p.sh. "Shtator 2025"
  const headerTitle = format(startDate, "MMMM yyyy", { locale: sq });

  // 7 ditët e javës
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    const dayEvents = events.filter((event) =>
      isSameDay(date, parseISO(event.date))
    );
    // p.sh. "Hën 01"
    const dayLabel = format(date, "EEE dd", { locale: sq });

    return { date, dayLabel, events: dayEvents };
  });

  return (
    <div className="space-y-4">
      {/* Shfaq "Shtator 2025" sipas startDate */}
      <div className="text-center text-xl font-semibold mb-2">
        {/* {headerTitle} */}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {days.map((dayInfo, index) => (
          <div key={index} className="border rounded-lg flex flex-col">
            <div className="bg-gray-100 p-2 text-center rounded-t-lg">
              <div className="text-lg font-bold">{dayInfo.dayLabel}</div>
            </div>
            <div className="p-2">
              {dayInfo.events.length > 0 ? (
                dayInfo.events.map((event) => (
                  <ScheduleEventComponentExams key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center text-gray-400 mt-2">
                  S’ka provime
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
