
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterOptions } from '@/types';
import { academicYears, semesters, yearsOfStudy } from '@/data/scheduleData';

interface FilterPanelProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  compact?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, compact = false }) => {
  const updateFilters = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <Select
          value={filters.academicYear}
          onValueChange={(value) => updateFilters('academicYear', value)}
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

        <Select
          value={filters.semester}
          onValueChange={(value) => updateFilters('semester', value)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester) => (
              <SelectItem key={semester} value={semester}>
                {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.yearOfStudy}
          onValueChange={(value) => updateFilters('yearOfStudy', value)}
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

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Academic Year</label>
          <Select
            value={filters.academicYear}
            onValueChange={(value) => updateFilters('academicYear', value)}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Semester</label>
          <Select
            value={filters.semester}
            onValueChange={(value) => updateFilters('semester', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Year of Study</label>
          <Select
            value={filters.yearOfStudy}
            onValueChange={(value) => updateFilters('yearOfStudy', value)}
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
