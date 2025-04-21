import React from "react";
import { ScheduleItem } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduleEventProps {
  event: ScheduleItem;
}

const ScheduleEventComponent: React.FC<ScheduleEventProps> = ({ event }) => {
  const isMobile = useIsMobile();

  // Helper to format time from "HH:MM:SS" to "HH:MM"
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    return `${h}:${m}`;
  };

  const subject = event.subjectName || event.eventType;
  const professor = event.instructorName || "";
  const typeLabel = event.eventType; // e.g. "Ligjerata", "Ushtrime g1"
  const timeRange = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
  const location = event.locationName;

  // Base styling
  let containerClass = "schedule-item rounded-md border";
  const eventType = typeLabel.toLowerCase(); // for easy string matching

  // Color categories:
  // - "ligjerata" => purple
  // - anything containing "ushtrime" => green
  // - else => gray fallback
  if (eventType.includes("ligjerata")) {
    containerClass = cn(containerClass, "bg-purple-50 border-purple-200 text-purple-700");
  } else if (eventType.includes("ushtrime")) {
    containerClass = cn(containerClass, "bg-green-50 border-green-200 text-green-700");
  } else {
    containerClass = cn(containerClass, "bg-gray-50 border-gray-200 text-gray-700");
  }

  // Render differently for mobile vs desktop
  if (isMobile) {
    return (
      <div className={cn(containerClass, "mb-1 p-1 text-[10px]")}>
        <div className="font-semibold truncate">{subject}</div>
        {professor && <div className="mt-0.5 truncate">{professor}</div>}
        <div className="mt-0.5 truncate">{typeLabel}</div>
        <div className="mt-0.5 flex items-center justify-between">
          <span>{timeRange}</span>
          <span className="truncate">{location}</span>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={cn(containerClass, "mb-2 p-2 text-xs")}>
      <div className="font-semibold ">{subject}</div>
      {professor && <div className="mt-0.5 font-medium truncate">{professor}</div>}
      <div className="mt-0.5 truncate">{typeLabel}</div>
      <div className="mt-0.5">{timeRange}</div>
      <div className="truncate">{location}</div>
    </div>
  );
};

export default ScheduleEventComponent;
