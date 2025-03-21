import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ScheduleEvent } from "@/types";
import ScheduleEventComponent from "./ScheduleEvent";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthViewProps {
  events: ScheduleEvent[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const MonthView: React.FC<MonthViewProps> = ({
  events,
  currentDate,
  setCurrentDate,
}) => {
  const isMobile = useIsMobile();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const today = new Date();

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const header = (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-lg md:text-xl font-semibold text-center flex-1">
        {format(currentDate, "MMMM yyyy")}
      </div>
      <Button variant="outline" size="icon" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const daysOfWeek = isMobile
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayHeaders = daysOfWeek.map((day, index) => (
    <div
      key={index}
      className="p-1 md:p-2 text-center font-medium text-xs md:text-sm text-muted-foreground"
    >
      {day}
    </div>
  ));

  let day = startDate;
  const rows: JSX.Element[] = [];
  let days: JSX.Element[] = [];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);

      const dayEvents = events.filter((event) =>
        isSameDay(day, parseISO(event.date))
      );

      days.push(
        <div
          key={cloneDay.toString()}
          className={cn(
            "border p-1 md:p-2 min-h-[60px] md:min-h-[100px] transition-colors",
            "rounded-md overflow-hidden",
            !isSameMonth(day, monthStart) ? "bg-gray-100 text-gray-400" : "bg-white",
            isSameDay(day, today) ? "bg-blue-50 border-blue-300" : "",
            "hover:bg-muted/10"
          )}
        >
          <div className="text-right mb-1 font-medium text-xs md:text-sm">
            {format(day, "d")}
          </div>
          <div className="rounded-md bg-blue-50 px-2 py-1 text-sm text-purple-700 font-medium shadow-sm">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <ScheduleEventComponent key={event.id} event={event} />
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center">No exams</div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }

    rows.push(
      <div key={day.toString()} className="grid grid-cols-7 gap-2 md:gap-4">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="rounded-xl bg-white p-2 md:p-4 shadow-sm">
      {header}
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">{dayHeaders}</div>
      <div className="space-y-2 ">{rows}</div>
    </div>
  );
};

export default MonthView;
