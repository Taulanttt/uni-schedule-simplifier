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
import { yearsOfStudy } from "@/data/scheduleData";

interface SemesterData {
  id: string;
  name: string;
}

interface AcademicYearData {
  id: string;
  name: string;
  isActive: boolean;
}

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

  useEffect(() => {
    async function fetchSemesters() {
      try {
        const res = await axiosInstance.get<SemesterData[]>("/semesters");
        setSemesters(res.data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së semestrave:", error);
      }
    }
    fetchSemesters();
  }, []);

  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const res = await axiosInstance.get<AcademicYearData[]>("/academic-year");
        const activeYears = res.data.filter((ay) => ay.isActive === true);
        setAcademicYears(activeYears);
      } catch (error) {
        console.error("Gabim gjatë marrjes së viteve akademike:", error);
      }
    }
    fetchAcademicYears();
  }, []);

  const updateFilters = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Compact mode
  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <Select
          value={filters.academicYear}
          onValueChange={(val) => updateFilters("academicYear", val)}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Viti Akademik" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year.id} value={year.name}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.semester}
          onValueChange={(val) => updateFilters("semester", val)}
        >
          <SelectTrigger className="w-[110px] h-8">
            <SelectValue placeholder="Semestri" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.yearOfStudy}
          onValueChange={(val) => updateFilters("yearOfStudy", val)}
        >
          <SelectTrigger className="w-[90px] h-8">
            <SelectValue placeholder="Viti" />
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

  // Full version with labels
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filtër</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Akademik</label>
          <Select
            value={filters.academicYear}
            onValueChange={(val) => updateFilters("academicYear", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Viti Akademik" />
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Semestri</label>
          <Select
            value={filters.semester}
            onValueChange={(val) => updateFilters("semester", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semestri" />
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Viti i Studimeve</label>
          <Select
            value={filters.yearOfStudy}
            onValueChange={(val) => updateFilters("yearOfStudy", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Viti" />
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
