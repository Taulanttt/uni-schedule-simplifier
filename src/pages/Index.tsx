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

  // Gjendja e filtrit
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "2024/25",
    semester: "Verore",
    yearOfStudy: "Viti 1",
  });

  // Lista e orareve nga API
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Marrim oraret kur komponenti ngarkohet
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
        setSchedules(res.data);
      } catch (err) {
        console.error("Gabim gjatë marrjes së orareve:", err);
      }
    }
    fetchSchedules();
  }, []);

  // Filtrimi i orareve
  const filteredSchedules = schedules.filter((item) => {
    // Sipas vitit akademik (nëse nuk është “All Semesters”/“All Years”)
    if (
      filters.academicYear !== "All Semesters" &&
      item.academicYear !== filters.academicYear
    ) {
      return false;
    }

    // Sipas semestrit
    if (
      filters.semester !== "All Semesters" &&
      item.semesterName !== filters.semester
    ) {
      return false;
    }

    // Sipas vitit të studimeve
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
      {/* Koka: Paneli i filtrit + zgjedhja (Day / Week) */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <FilterPanel filters={filters} setFilters={setFilters} compact />
        <div className="flex space-x-2">
          <Button
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
          >
            Dita
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            Java
          </Button>
        </div>
      </div>

      {/* Zona kryesore e orarit */}
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

      {/* Legjenda në fund */}
      <LegendComponent />
    </div>
  );
};

export default Index;
