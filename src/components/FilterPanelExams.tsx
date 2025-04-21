import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { yearsOfStudy } from "@/data/scheduleData";
import { FilterOptionsexam } from "@/types";

// Props
interface FilterPanelProps {
  filters: FilterOptionsexam;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptionsexam>>;
  compact?: boolean;
}

// Models
interface AfatiData {
  id: string;
  name: string;
}

interface AcademicYearData {
  id: string;
  name: string;
  isActive: boolean;
}

const FilterPanelExams: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  compact = false,
}) => {
  const [afatiList, setAfatiList] = useState<AfatiData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearData[]>([]);

  useEffect(() => {
    async function fetchAfati() {
      try {
        const res = await axiosInstance.get<AfatiData[]>("/afati");
        setAfatiList(res.data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së afateve:", error);
      }
    }
    fetchAfati();
  }, []);

  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const res = await axiosInstance.get<AcademicYearData[]>("/academic-year");
        const active = res.data.filter((ay) => ay.isActive);
        setAcademicYears(active);
      } catch (error) {
        console.error("Gabim gjatë viteve akademike:", error);
      }
    }
    fetchAcademicYears();
  }, []);

  const updateFilters = (key: keyof FilterOptionsexam, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Compact version
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
            {academicYears.map((ay) => (
              <SelectItem key={ay.id} value={ay.name}>
                {ay.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.afati}
          onValueChange={(val) => updateFilters("afati", val)}
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

        <Select
          value={filters.yearOfStudy}
          onValueChange={(val) => updateFilters("yearOfStudy", val)}
        >
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Viti" />
          </SelectTrigger>
          <SelectContent>
            {yearsOfStudy.map((yr) => (
              <SelectItem key={yr} value={yr}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filtro Provimet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Akademik</label>
          <Select
            value={filters.academicYear}
            onValueChange={(val) => updateFilters("academicYear", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Zgjidh Vitin Akademik" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((ay) => (
                <SelectItem key={ay.id} value={ay.name}>
                  {ay.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Afati</label>
          <Select
            value={filters.afati}
            onValueChange={(val) => updateFilters("afati", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Zgjidh Afatin" />
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Viti i Studimeve</label>
          <Select
            value={filters.yearOfStudy}
            onValueChange={(val) => updateFilters("yearOfStudy", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Zgjidh Vitin e Studimeve" />
            </SelectTrigger>
            <SelectContent>
              {yearsOfStudy.map((yr) => (
                <SelectItem key={yr} value={yr}>
                  {yr}
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
