"use client";

import React, { useEffect, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { yearsOfStudy } from "@/data/scheduleData";
import { FilterOptionsexam } from "@/types";

/* ────────── models ────────── */
interface AfatiData        { id: string; name: string }
interface AcademicYearData { id: string; name: string; isActive: boolean }

/* ────────── props ────────── */
interface Props {
  filters:    FilterOptionsexam;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptionsexam>>;
  compact?:   boolean;
}

/* helper select (avoids repetition) */
const Field:React.FC<{
  value:string; onChange:(v:string)=>void;
  placeholder:string; width?:string; children:React.ReactNode;
}> = ({value,onChange,placeholder,width="w-full",children}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={`h-8 ${width}`}>
      <SelectValue placeholder={placeholder}/>
    </SelectTrigger>
    <SelectContent>{children}</SelectContent>
  </Select>
);

/* ========================================================================= */
const FilterPanelExams:React.FC<Props> = ({ filters, setFilters, compact=false }) => {
  const [afati , setAfati ] = useState<AfatiData[]>([]);
  const [years , setYears ] = useState<AcademicYearData[]>([]);

  useEffect(()=>{
    axiosInstance.get<AfatiData[]>("/afati").then(r=>setAfati(r.data));
    axiosInstance.get<AcademicYearData[]>("/academic-year")
                 .then(r=>setYears(r.data.filter(y=>y.isActive)));
  },[]);

  const update = (key:keyof FilterOptionsexam)=>(v:string)=>
    setFilters(prev=>({...prev, [key]: v}));

  /* ============== COMPACT ============== */
  if (compact){
    return (
      <div className="flex items-center gap-2">
        <Field
          value={filters.academicYear}
          onChange={update("academicYear")}
          placeholder="Viti ak."
          width="w-[140px]"
        >
          {years.map(y=> <SelectItem key={y.id} value={y.name}>{y.name}</SelectItem>)}
        </Field>

        <Field
          value={filters.afati}
          onChange={update("afati")}
          placeholder="Afati"
          width="w-[120px]"
        >
          {afati.map(a=> <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
        </Field>

        <Field
          value={filters.yearOfStudy}
          onChange={update("yearOfStudy")}
          placeholder="Viti"
          width="w-[110px]"
        >
          {yearsOfStudy.map(y=> <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </Field>
      </div>
    );
  }

  /* ============== FULL ============== */
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">Filtro Provimet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Academic year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Akademik</label>
          <Field
            value={filters.academicYear}
            onChange={update("academicYear")}
            placeholder="Zgjidh vitin akademik"
          >
            {years.map(y=> <SelectItem key={y.id} value={y.name}>{y.name}</SelectItem>)}
          </Field>
        </div>

        {/* Afati */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Afati</label>
          <Field
            value={filters.afati}
            onChange={update("afati")}
            placeholder="Zgjidh afatin"
          >
            {afati.map(a=> <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
          </Field>
        </div>

        {/* Study year */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Viti Studimeve</label>
          <Field
            value={filters.yearOfStudy}
            onChange={update("yearOfStudy")}
            placeholder="Zgjidh vitin"
          >
            {yearsOfStudy.map(y=> <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </Field>
        </div>

      </div>
    </div>
  );
};

export default FilterPanelExams;
