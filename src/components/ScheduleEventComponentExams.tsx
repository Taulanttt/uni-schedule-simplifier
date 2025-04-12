import React from "react";
import { ExamItem } from "@/pages/Exams";
import { cn } from "@/lib/utils";

// A small helper to parse event type and pick the style
function getEventClasses(eventType: string) {
  const lower = eventType.toLowerCase();

  if (lower.includes("provim")) {
    // "provime", "Provime"
    return "bg-blue-50 border border-blue-200 text-blue-700";
  } else if (lower.includes("ligjerata")) {
    return "bg-purple-50 border border-purple-200 text-purple-700";
  } else if (lower.includes("ushtrime")) {
    return "bg-green-50 border border-green-200 text-green-700";
  }
  // fallback
  return "bg-gray-50 border border-gray-200 text-gray-700";
}

interface ScheduleEventProps {
  event: ExamItem;
}

const ScheduleEventComponentExams: React.FC<ScheduleEventProps> = ({ event }) => {
  const containerClass = cn(
    "rounded-md px-2 py-1 text-sm mb-1",
    getEventClasses(event.eventType || "")
  );

  return (
    <div className={containerClass}>
      {/* Subject name */}
      <div className="font-semibold truncate">
        {event.Subject?.name || "No subject"}
      </div>
      {/* Instructor */}
      {event.Instructor && (
        <div className="truncate">{event.Instructor.name}</div>
      )}
      {/* Type */}
      {/* <div className="truncate">{event.eventType}</div> */}
      {/* Hour */}
      <div>{event.hour?.slice(0, 5)}</div>
    </div>
  );
};

export default ScheduleEventComponentExams;
