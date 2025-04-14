import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { FilterOptions } from "@/types";
import { yearsOfStudy } from "@/data/scheduleData"; // për "Year of Study" mbetet

interface SemesterData {
  id: string;
  name: string;
}

// Struktura e academic year
interface AcademicYearData {
  id: string;
  name: string;
  isActive: boolean;
}

// Props për FilterPanel
interface FilterPanelProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  compact?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  compact = false,
}) => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearData[]>([]);

  // Marrim semestrat
  useEffect(() => {
    async function fetchSemesters() {
      try {
        const res = await axiosInstance.get<SemesterData[]>("/semesters");
        setSemesters(res.data);
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    }
    fetchSemesters();
  }, []);

  // Marrim listën e viteve akademike dhe filtrojmë vetëm ata "isActive: true"
  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const res = await axiosInstance.get<AcademicYearData[]>("/academic-year");
        const activeYears = res.data.filter((ay) => ay.isActive === true);
        setAcademicYears(activeYears);
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    }
    fetchAcademicYears();
  }, []);

  const updateFilters = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // --- Compact Layout ---
  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        {/* Academic Year */}
        <Select
          value={filters.academicYear}
          onValueChange={(val) => updateFilters("academicYear", val)}
        >
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year.id} value={year.name}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Semester */}
        <Select
          value={filters.semester}
          onValueChange={(val) => updateFilters("semester", val)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year of Study */}
        <Select
          value={filters.yearOfStudy}
          onValueChange={(val) => updateFilters("yearOfStudy", val)}
        >
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Study Year" />
          </SelectTrigger>
          <SelectContent>
            {yearsOfStudy.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // --- Full Layout ---
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filterat</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Academic Year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Akademik</label>
          <Select
            value={filters.academicYear}
            onValueChange={(val) => updateFilters("academicYear", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.name}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Semestrat</label>
          <Select
            value={filters.semester}
            onValueChange={(val) => updateFilters("semester", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year of Study */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti i Studimeve</label>
          <Select
            value={filters.yearOfStudy}
            onValueChange={(val) => updateFilters("yearOfStudy", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year of Study" />
            </SelectTrigger>
            <SelectContent>
              {yearsOfStudy.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
