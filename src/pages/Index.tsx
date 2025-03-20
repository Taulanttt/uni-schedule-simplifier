import React, { useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import WeekView from "@/components/WeekView";
import DayView from "@/components/DayView";
import LegendComponent from "@/components/LegendComponent";
import { scheduleData, getFilteredSchedule } from "@/data/scheduleData";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week">("week");
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "2024/25",
    semester: "All Semesters",
    yearOfStudy: "All Years",
  });

  const filteredEvents = getFilteredSchedule(
    scheduleData,
    filters.academicYear,
    filters.semester,
    filters.yearOfStudy
  );

  return (
    <div className="flex flex-col h-full">
      {/* e.g. top area: filter + day/week toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <FilterPanel filters={filters} setFilters={setFilters} compact />

        <div className="flex space-x-2">
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
          >
            Day
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            Week
          </Button>
        </div>
      </div>

      {/* The main schedule area */}
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view === "day" && (
          <DayView
            events={filteredEvents}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
          />
        )}

        {view === "week" && (
          <WeekView events={filteredEvents} currentDate={currentDate} />
        )}
      </div>

      <LegendComponent />
    </div>
  );
};

export default Index;
