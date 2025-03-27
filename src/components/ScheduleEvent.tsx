import React from "react";
import { ScheduleItem } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduleEventProps {
  event: ScheduleItem;
}

const ScheduleEventComponent: React.FC<ScheduleEventProps> = ({ event }) => {
  const isMobile = useIsMobile();

  // Use subjectName directly and fallback to eventType
  const subject = event.subjectName || event.eventType;
  const professor = event.instructorName || "";

  // Color coding based on event type
  let containerClass = "schedule-item rounded-md border";
  const eventType = event.eventType.toLowerCase();
  if (eventType.includes("exam")) {
    containerClass = cn(containerClass, "bg-indigo-50 border-indigo-200 text-indigo-700");
  } else if (eventType.includes("lab")) {
    containerClass = cn(containerClass, "bg-green-50 border-green-200 text-green-700");
  } else if (eventType.includes("office")) {
    containerClass = cn(containerClass, "bg-blue-50 border-blue-200 text-blue-700");
  } else if (eventType.includes("lecture")) {
    containerClass = cn(containerClass, "bg-purple-50 border-purple-200 text-purple-700");
  } else {
    containerClass = cn(containerClass, "bg-gray-50 border-gray-200 text-gray-700");
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className={cn(containerClass, "mb-1 p-1 text-[10px]")}>
        <div className="font-semibold truncate">{subject}</div>
        {professor && (
          <div className="text-[10px] mt-0.5 font-medium truncate">{professor}</div>
        )}
        <div className="text-[10px] mt-0.5 flex items-center justify-between">
          <span>{event.startTime} - {event.endTime}</span>
          <span className="truncate">{event.locationName}</span>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={cn(containerClass, "mb-2 p-2 text-xs")}>
      <div className="font-semibold truncate">{subject}</div>
      {professor && (
        <div className="text-xs mt-0.5 font-medium truncate">{professor}</div>
      )}
      <div className="text-xs mt-0.5 flex items-center justify-between">
        <span>{event.startTime} - {event.endTime}</span>
        <span className="truncate">{event.locationName}</span>
      </div>
    </div>
  );
};

export default ScheduleEventComponent;
