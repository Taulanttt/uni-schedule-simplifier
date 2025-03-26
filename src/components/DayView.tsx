// DayView.tsx
import React from "react";
import { format } from "date-fns";
import { ScheduleEvent } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";

interface DayViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  view: "day" | "week";
  setView: React.Dispatch<React.SetStateAction<"day" | "week">>;
}

const DayView: React.FC<DayViewProps> = ({
  events,
  currentDate,
}) => {
  // Get the day of week as a number (0-6, where 0 is Sunday)
  const dayOfWeek = currentDate.getDay();

  // Filter events for the current day
  const dayEvents = events.filter((event) => event.day === dayOfWeek);

  return (
    <div className="border rounded-lg">
      <div className="bg-gray-100 p-3 flex justify-center items-center rounded-t-lg">
        <div className="text-xl font-bold">
          {format(currentDate, "EEEE")}
        </div>
      </div>

      <div className="p-4 min-h-[300px]">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <ScheduleEventComponent key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No exams scheduled
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
