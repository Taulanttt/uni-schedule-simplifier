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

// Struktura e props për komponentin
interface FilterPanelProps {
  filters: FilterOptionsexam;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptionsexam>>;
  compact?: boolean;
}

// Struktura e Afatit
interface AfatiData {
  id: string;
  name: string;
}

// Struktura e Vitit Akademik
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

  // Marrim listën e afateve nga API
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

  // Marrim listën e viteve akademike (vetëm ata që janë aktivë)
  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const res = await axiosInstance.get<AcademicYearData[]>("/academic-year");
        // Filtrojmë vetëm ata aktivë
        const active = res.data.filter((ay) => ay.isActive);
        setAcademicYears(active);
      } catch (error) {
        console.error("Gabim gjatë marrjes së viteve akademike:", error);
      }
    }
    fetchAcademicYears();
  }, []);

  // Funksion për ndryshimin e filtrave
  const updateFilters = (key: keyof FilterOptionsexam, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /*
   * Në këtë variant, nuk kemi “Të gjitha Vitet” apo “Të gjithë Afatët”.
   * Përdoruesi duhet të zgjedhë një vlerë ekzistuese.
   */

  // 1) Layout i thjeshtë (compact)
  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        {/* Viti Akademik */}
        <Select
          value={filters.academicYear}
          onValueChange={(value) => updateFilters("academicYear", value)}
        >
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Viti" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((ay) => (
              <SelectItem key={ay.id} value={ay.name}>
                {ay.name}
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

        {/* Viti i Studimeve */}
        <Select
          value={filters.yearOfStudy}
          onValueChange={(value) => updateFilters("yearOfStudy", value)}
        >
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Viti Studimeve" />
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

  // 2) Layout i plotë (me etiketa dhe hapësira)
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filtro Provimet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Viti Akademik */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Akademik</label>
          <Select
            value={filters.academicYear}
            onValueChange={(value) => updateFilters("academicYear", value)}
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

        {/* Afati */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Afati (Periudha e Provimit)</label>
          <Select
            value={filters.afati}
            onValueChange={(value) => updateFilters("afati", value)}
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

        {/* Viti i Studimeve */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti i Studimeve</label>
          <Select
            value={filters.yearOfStudy}
            onValueChange={(value) => updateFilters("yearOfStudy", value)}
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
