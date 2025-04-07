import React, { useState, useEffect } from "react";
import FilterPanel from "@/components/FilterPanel";
import WeekView from "@/components/WeekView";
import DayView from "@/components/DayView";
import LegendComponent from "@/components/LegendComponent";
import { FilterOptions, ScheduleItem } from "@/types";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";

const Index: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week">("week");

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "2024/25",
    semester: "Verore",
    yearOfStudy: "Year 1",
  });

  // The array of schedules from the API
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Fetch schedules on mount
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
        setSchedules(res.data);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    }
    fetchSchedules();
  }, []);

  // Filter schedules based on user selections
  const filteredSchedules = schedules.filter((item) => {
    // Filter by academicYear if not "All Semesters"/"All Years"
    if (
      filters.academicYear !== "All Semesters" &&
      item.academicYear !== filters.academicYear
    ) {
      return false;
    }

    // Filter by semester
    if (
      filters.semester !== "All Semesters" &&
      item.semesterName !== filters.semester
    ) {
      return false;
    }

    // Filter by yearOfStudy
    if (filters.yearOfStudy !== "All Years") {
      const numericYear = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (item.studyYear !== numericYear) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col">
      {/* Top: FilterPanel + day/week toggle */}
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

      {/* Main schedule area */}
      <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
        {view === "day" && (
          <DayView
            events={filteredSchedules}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
          />
        )}

        {view === "week" && (
          <WeekView
            events={filteredSchedules}
            currentDate={currentDate}
          />
        )}
      </div>

      {/* Legend */}
      <LegendComponent />
    </div>
  );
};

export default Index;
