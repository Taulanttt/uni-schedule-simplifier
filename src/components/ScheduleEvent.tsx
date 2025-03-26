import React from "react";
import { ScheduleEvent as ScheduleEventType } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduleEventProps {
  event: ScheduleEventType;
}

const ScheduleEvent: React.FC<ScheduleEventProps> = ({ event }) => {
  const isMobile = useIsMobile();

  // If event.title is something like "CS 101: Dr. Thompson",
  // split into subject ("CS 101") and professor ("Dr. Thompson")
  const titleParts = event.title.split(":");
  const subject = titleParts[0].trim();
  const professor = titleParts.length > 1 ? titleParts[1].trim() : "";

  // Common color classes based on event type
  const containerClass = cn(
    "schedule-item rounded-md border",
    event.type === "lecture" && "bg-purple-50 border-purple-200 text-purple-700",
    event.type === "lab" && "bg-green-50 border-green-200 text-green-700",
    event.type === "office" && "bg-blue-50 border-blue-200 text-blue-700",
    event.type === "exam" && "bg-indigo-50 border-indigo-200 text-indigo-700" // <-- EXAM color
  );

  // For mobile, show smaller fonts but same data
  if (isMobile) {
    return (
      <div className={cn(containerClass, "mb-1 p-1 text-[10px]")}>
        <div className="font-semibold truncate">{subject}</div>
        {professor && (
          <div className="text-[10px] mt-0.5 font-medium truncate">
            {professor}
          </div>
        )}
        <div className="text-[10px] mt-0.5 flex items-center justify-between">
          <span>{event.time}</span>
          <span className="truncate">{event.location}</span>
        </div>
      </div>
    );
  }

  // Desktop (or non-mobile) layout
  return (
    <div className={cn(containerClass, "mb-2 p-2 text-xs")}>
      <div className="font-semibold truncate">{subject}</div>
      {professor && (
        <div className="text-xs mt-0.5 font-medium truncate">{professor}</div>
      )}
      <div className="text-xs mt-0.5 flex items-center justify-between">
        <span>{event.time}</span>
        <span className="truncate">{event.location}</span>
      </div>
    </div>
  );
};

export default ScheduleEvent;
