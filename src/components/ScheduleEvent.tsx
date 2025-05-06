import React from "react";
import { ScheduleItem } from "@/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/* --------------------------------------------------------------
   Përkthimi i gërmës së parë → meta (ngjyra + emër i plotë)
---------------------------------------------------------------- */
const TYPE_META = {
  L: {
    full: "Ligjërata",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  U: {
    full: "Ushtrime",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  P: {
    full: "Provime",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
} as const;

type ShortType = keyof typeof TYPE_META;

/* -------------------------------------------------------------- */

interface ScheduleEventProps {
  event: ScheduleItem;
}

const ScheduleEventComponent: React.FC<ScheduleEventProps> = ({ event }) => {
  const isMobile = useIsMobile();

  /* ------------- helpers ------------- */
  const formatTime = (t?: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    return `${h}:${m}`;
  };

  /* ------------- metadata ------------- */
  // Merr gërmën e parë (p.sh. "Ligjerata" → "L")
  const short: ShortType = (event.eventType?.trim().charAt(0).toUpperCase() ||
    "L") as ShortType;
  const meta = TYPE_META[short] ?? {
    full: event.eventType,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
  };

  const timeRange = `${formatTime(event.startTime)} - ${formatTime(
    event.endTime
  )}`;

  /* ------------- common card class ------------- */
  const base =
    "rounded-md border mb-2 " + meta.bg + " " + meta.border + " " + meta.text;

  /* ------------- MOBILE ------------- */
  if (isMobile) {
    return (
      <div className={cn(base, "p-1 text-[10px]")}>
        <div className="font-semibold truncate">{event.subjectName}</div>

        {event.instructorName && (
          <div className="truncate">{event.instructorName}</div>
        )}

        {/* tipi i plotë nga meta */}
        <div>{meta.full}</div>

        <div className="flex justify-between">
          <span>{timeRange}</span>
          <span className="truncate">{event.locationName}</span>
        </div>
      </div>
    );
  }

  /* ------------- DESKTOP ------------- */
  return (
    <div className={cn(base, "p-2 text-xs")}>
      <div className="font-semibold">{event.subjectName}</div>

      {event.instructorName && (
        <div className="font-medium">{event.instructorName}</div>
      )}

      <div>{meta.full}</div>

      <div>{timeRange}</div>
      <div>{event.locationName}</div>
    </div>
  );
};

export default ScheduleEventComponent;
