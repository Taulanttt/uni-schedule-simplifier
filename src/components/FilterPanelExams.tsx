import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { academicYears, yearsOfStudy } from "@/data/scheduleData";
import { FilterOptionsexam } from "@/types";

interface FilterPanelProps {
  filters: FilterOptionsexam;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptionsexam>>;
  compact?: boolean;
}

interface AfatiData {
  id: string;
  name: string;
}

const FilterPanelExams: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  compact = false,
}) => {
  const [afatiList, setAfatiList] = useState<AfatiData[]>([]);

  useEffect(() => {
    async function fetchAfati() {
      try {
        const res = await axiosInstance.get<AfatiData[]>("/afati");
        setAfatiList(res.data);
      } catch (error) {
        console.error("Error fetching afati:", error);
      }
    }
    fetchAfati();
  }, []);

  const updateFilters = (key: keyof FilterOptionsexam, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        {/* Academic Year */}
        <Select
          value={filters.academicYear}
          onValueChange={(value) => updateFilters("academicYear", value)}
        >
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Afati */}
        <Select
          value={filters.afati}
          onValueChange={(value) => updateFilters("afati", value)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Afati" />
          </SelectTrigger>
          <SelectContent>
            {afatiList.map((af) => (
              <SelectItem key={af.id} value={af.name}>
                {af.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year of Study */}
        <Select
          value={filters.yearOfStudy}
          onValueChange={(value) => updateFilters("yearOfStudy", value)}
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

  // Full Layout
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Academic Year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Academic Year</label>
          <Select
            value={filters.academicYear}
            onValueChange={(value) => updateFilters("academicYear", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Afati */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Afati (Exam Period)</label>
          <Select
            value={filters.afati}
            onValueChange={(value) => updateFilters("afati", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Afati" />
            </SelectTrigger>
            <SelectContent>
              {afatiList.map((af) => (
                <SelectItem key={af.id} value={af.name}>
                  {af.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year of Study */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Year of Study</label>
          <Select
            value={filters.yearOfStudy}
            onValueChange={(value) => updateFilters("yearOfStudy", value)}
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

export default FilterPanelExams;
