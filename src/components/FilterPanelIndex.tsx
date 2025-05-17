"use client";

import React, { useEffect, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { FilterOptions } from "@/types";
import { yearsOfStudy } from "@/data/scheduleData";

/* ---------- DTOs ---------- */
interface SemesterData     { id: string; name: string }
interface AcademicYearData { id: string; name: string; isActive: boolean }

/* ---------- props ---------- */
interface Props {
  filters:    FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  compact?:   boolean;
}

/* ================================================================= */
const FilterPanel:React.FC<Props> = ({ filters, setFilters, compact=false }) => {
  const [semesters    , setSemesters]     = useState<SemesterData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearData[]>([]);

  /* fetch static data once */
  useEffect(()=>{
    axiosInstance.get<SemesterData[]>("/semesters").then(r=>setSemesters(r.data));
    axiosInstance.get<AcademicYearData[]>("/academic-year")
                 .then(r=>setAcademicYears(r.data.filter(a=>a.isActive)));
  },[]);

  const update = (key:keyof FilterOptions,value:string)=>
    setFilters(prev=>({...prev,[key]:value}));

  /* re-usable <Select> piece */
  const SelectBox:React.FC<{
    value:string; onChange:(v:string)=>void; placeholder:string; width:string;
    children:React.ReactNode;
  }> = ({value,onChange,placeholder,width,children})=>(
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-8 ${width}`}>
        <SelectValue placeholder={placeholder}/>
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );

  /* ================= COMPACT ================= */
  if(compact){
    return (
      <div className="flex gap-2 items-center">
        {/* academic year */}
        <SelectBox
          value={filters.academicYear}
          onChange={v=>update("academicYear",v)}
          placeholder="Viti Ak."
          width="w-[140px]"
        >
          {academicYears.map(ay=>(
            <SelectItem key={ay.id} value={ay.name}>{ay.name}</SelectItem>
          ))}
        </SelectBox>

        {/* semester */}
        <SelectBox
          value={filters.semester}
          onChange={v=>update("semester",v)}
          placeholder="Semestri"
          width="w-[120px]"
        >
          {semesters.map(s=><SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
        </SelectBox>

        {/* study-year */}
        <SelectBox
          value={filters.yearOfStudy}
          onChange={v=>update("yearOfStudy",v)}
          placeholder="Viti"
          width="w-[110px]"
        >
          {yearsOfStudy.map(y=><SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectBox>
      </div>
    );
  }

  /* ================= FULL ================= */
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filtër</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* academic year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Akademik</label>
          <SelectBox
            value={filters.academicYear}
            onChange={v=>update("academicYear",v)}
            placeholder="Zgjidh vitin akademik"
            width="w-full"
          >
            {academicYears.map(ay=>(
              <SelectItem key={ay.id} value={ay.name}>{ay.name}</SelectItem>
            ))}
          </SelectBox>
        </div>

        {/* semester */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Semestri</label>
          <SelectBox
            value={filters.semester}
            onChange={v=>update("semester",v)}
            placeholder="Zgjidh semestrin"
            width="w-full"
          >
            {semesters.map(s=>(
              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectBox>
        </div>

        {/* study year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti i Studimeve</label>
          <SelectBox
            value={filters.yearOfStudy}
            onChange={v=>update("yearOfStudy",v)}
            placeholder="Zgjidh vitin"
            width="w-full"
          >
            {yearsOfStudy.map(y=>(
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectBox>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
