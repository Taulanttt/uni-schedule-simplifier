/* ================================================================== */
/*  pages/admin/SchedulesAdminPage.tsx                                */
/*  – group → collapse, full-info table, live update, nice placeholders*/
/* ================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import axios          from "@/utils/axiosInstance";
import { useForm }    from "react-hook-form";
import FilterPanel    from "@/components/FilterPanel";
import clsx           from "clsx";

/* ---------- DTOs ---------- */
interface AcademicYear { id: string; name: string }
interface Option        { id: string; name: string }
interface Location      { id: string; roomName: string }

interface ScheduleItem {
  id: string;
  eventType: string;
  startTime: string;
  endTime:   string;
  daysOfWeek: string[];
  studyYear:  number;
  academicYearId: string|null;
  semesterId:     string;
  semesterName:   string;
  subjectId:      string; subjectName:     string;
  instructorId:   string; instructorName:  string;
  classLocationId:string; locationName:    string;
  status: "draft"|"published";
}

/* ---------- helpers ---------- */
const DIG   = (v:string)=>v.replace(/\D/g,"").slice(0,4);
const toUi  = (d:string)=>`${d.padEnd(4,"-").slice(0,2)}:${d.padEnd(4,"-").slice(2)}`;
const toSql = (d:string)=>`${DIG(d).slice(0,2)}:${DIG(d).slice(2)}:00`;

const DAY:{[k:string]:string}= {
  Monday:"E hënë", Tuesday:"E martë", Wednesday:"E mërkurë",
  Thursday:"E enjte", Friday:"E premte", Saturday:"E shtunë", Sunday:"E diel",
};

/* ---------- UI filter model ---------- */
type Filters = {
  academicYear : string;
  semester     : string;
  yearOfStudy  : string;
  status       : string;
};

/* ================================================================= */
const SchedulesAdminPage:React.FC = () => {
  /* ------------ data ------------- */
  const [rows      , setRows]       = useState<ScheduleItem[]>([]);
  const [years     , setYears]      = useState<AcademicYear[]>([]);
  const [subjects  , setSubjects]   = useState<Option[]>([]);
  const [instructors,setInstructors]= useState<Option[]>([]);
  const [semesters , setSemesters]  = useState<Option[]>([]);
  const [locations , setLocations]  = useState<Location[]>([]);
  const [loading   , setLoading]    = useState(true);

  /* ------------ filters ---------- */
  const [filters, setFilters] = useState<Filters>({
    academicYear : "All Semesters",
    semester     : "All Semesters",
    yearOfStudy  : "All Years",
    status       : "All",
  });

  /* groups that are EXPANDED (default = none → all collapsed) */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /* ------------ edit modal -------- */
  const [open   , setOpen]   = useState(false);
  const [editing, setEditing]= useState<ScheduleItem|null>(null);
  const {register, handleSubmit, reset, watch, setValue} = useForm<any>();

  /* ------------ fetch ------------- */
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const [sch,yr,sub,ins,sem,loc] = await Promise.all([
          axios.get<ScheduleItem[]>("/schedules"),
          axios.get<AcademicYear[]>("/academic-year"),
          axios.get<Option[]>("/subjects"),
          axios.get<Option[]>("/instructors"),
          axios.get<Option[]>("/semesters"),
          axios.get<Location[]>("/class-locations"),
        ]);
        setRows(sch.data);
        setYears(yr.data);
        setSubjects(sub.data);
        setInstructors(ins.data);
        setSemesters(sem.data);
        setLocations(loc.data);
      }finally{ setLoading(false); }
    })();
  },[]);

  const yearName = (id?:string|null) => years.find(y=>y.id===id)?.name ?? "—";

  /* ------------ grouping ---------- */
  interface Group { key:string; title:string; status:"draft"|"published"; rows:ScheduleItem[] }
  const groups:Group[] = useMemo(()=>{
    const map=new Map<string,Group>();
    rows.forEach(r=>{
      /* filter gate */
      if(filters.academicYear!=="All Semesters" && yearName(r.academicYearId)!==filters.academicYear) return;
      if(filters.semester!=="All Semesters" && r.semesterName!==filters.semester) return;
      if(filters.yearOfStudy!=="All Years"){
        const n=parseInt(filters.yearOfStudy.replace(/\D/g,""),10);
        if(r.studyYear!==n) return;
      }
      if(filters.status!=="All" && r.status!==filters.status) return;

      const key=`${r.academicYearId}-${r.semesterId}-${r.studyYear}-${r.status}`;
      if(!map.has(key)){
        map.set(key,{
          key,
          status:r.status,
          title:`Orari ${yearName(r.academicYearId)} – ${r.semesterName} – Viti ${r.studyYear} (${r.status})`,
          rows:[],
        });
      }
      map.get(key)!.rows.push(r);
    });
    return [...map.values()].sort((a,b)=>a.title.localeCompare(b.title));
  },[rows,filters,years]);

  /* ------------ CRUD helpers ------ */
  const openModal = (r:ScheduleItem)=>{
    setEditing(r);
    reset({
      eventType:r.eventType,
      daysOfWeek:r.daysOfWeek[0],
      startTime:DIG(r.startTime),
      endTime:DIG(r.endTime),
      academicYearId:r.academicYearId||"",
      studyYear:String(r.studyYear),
      subjectId:r.subjectId,
      instructorId:r.instructorId,
      semesterId:r.semesterId,
      classLocationId:r.classLocationId,
    });
    setOpen(true);
    /* ensure its group is expanded so the update is visible later */
    const gKey=`${r.academicYearId}-${r.semesterId}-${r.studyYear}-${r.status}`;
    setExpanded(s=>new Set(s).add(gKey));
  };

  const save = async(data:any)=>{
    if(!editing) return;
    const payload={
      ...editing,
      eventType:data.eventType,
      startTime:toSql(data.startTime),
      endTime  :toSql(data.endTime),
      daysOfWeek:[data.daysOfWeek],
      academicYearId:data.academicYearId||null,
      studyYear:+data.studyYear,
      subjectId:data.subjectId,
      instructorId:data.instructorId,
      semesterId:data.semesterId,
      classLocationId:data.classLocationId,
    };
    await axios.put(`/schedules/${editing.id}`,payload);
    setRows(rs=>rs.map(r=>r.id===editing.id
      ? {...r,...payload,startTime:payload.startTime.slice(0,5),endTime:payload.endTime.slice(0,5)}
      : r
    ));
    setOpen(false);
  };

  const remove = async(id:string)=>{
    if(!confirm("Fshij këtë rresht?")) return;
    await axios.delete(`/schedules/${id}`);
    setRows(rs=>rs.filter(r=>r.id!==id));
  };

  const publish = async(g:Group)=>{
    if(g.status!=="draft") return;
    if(!confirm(`Publikoj “${g.title}”?`)) return;
    await Promise.all(g.rows.map(r=>axios.put(`/schedules/${r.id}`,{status:"published"})));
    setRows(rs=>rs.map(r=>g.rows.find(x=>x.id===r.id)?{...r,status:"published"}:r));
  };

  /* ------------ UI --------------- */
  return(
    <div className="w-full px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-6">Menaxho Orare</h1>

      <div className="mb-6">
        <FilterPanel filters={filters} setFilters={setFilters}/>
      </div>

      {loading ? "Po ngarkohet…" : (
        <div className="space-y-4">
          {groups.map(g=>{
            const open=expanded.has(g.key);
            const toggle=()=>setExpanded(s=>{
              const n=new Set(s);
              open?n.delete(g.key):n.add(g.key);
              return n;
            });
            return(
              <div key={g.key} className="border rounded shadow-sm">
                <button onClick={toggle}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200">
                  <span className="font-medium">{g.title}</span>
                  <div className="flex items-center gap-2">
                    {g.status==="draft" && (
                      <button onClick={e=>{e.stopPropagation();publish(g);}}
                              className="px-2 py-0.5 bg-green-600 text-white rounded text-xs">Publiko</button>
                    )}
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-xs",
                      g.status==="draft"
                        ?"bg-yellow-200 text-yellow-800"
                        :"bg-green-200 text-green-800")}>{g.status}</span>
                  </div>
                </button>

                {open && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {["Lloji","Ora","Ditët","Viti Akademik","Semestri","Viti","Lënda","Profesori","Salla","Status","✎"]
                            .map(h=><th key={h} className="p-2 text-left">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {g.rows.map(r=>(
                          <tr key={r.id} className="border-t">
                            <td className="p-2">{r.eventType}</td>
                            <td className="p-2">{r.startTime} – {r.endTime}</td>
                            <td className="p-2">{r.daysOfWeek.map(d=>DAY[d]||d).join(", ")}</td>
                            <td className="p-2">{yearName(r.academicYearId)}</td>
                            <td className="p-2">{r.semesterName}</td>
                            <td className="p-2">{r.studyYear}</td>
                            <td className="p-2">{r.subjectName}</td>
                            <td className="p-2">{r.instructorName}</td>
                            <td className="p-2">{r.locationName}</td>
                            <td className={clsx("p-2",r.status==="draft"?"text-yellow-700":"text-green-700")}>{r.status}</td>
                            <td className="p-2 whitespace-nowrap">
                              <button className="px-2 py-0.5 bg-blue-600 text-white rounded mr-1"
                                      onClick={()=>openModal(r)}>Edito</button>
                              <button className="px-2 py-0.5 bg-red-600 text-white rounded"
                                      onClick={()=>remove(r.id)}>Fshij</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {!groups.length && <p className="text-center text-gray-500">S’u gjet asnjë orar.</p>}
        </div>
      )}

      {/* ------------ EDIT MODAL ------------ */}
      {open && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl relative">
            <button className="absolute top-2 right-3 text-xl leading-none"
                    onClick={()=>setOpen(false)}>×</button>

            <h2 className="text-lg font-semibold mb-4">Edito orarin</h2>

            <form onSubmit={handleSubmit(save)} className="grid md:grid-cols-2 gap-4">
              {/* eventType */}
              <div><label className="block mb-1">Lloji</label>
                <input {...register("eventType")}
                       className="border p-1 rounded w-full" placeholder="Ligjëratë / Ushtrime"/></div>

              {/* day */}
              <div><label className="block mb-1">Dita</label>
                <select {...register("daysOfWeek")} className="border p-1 rounded w-full">
                  {Object.entries(DAY).map(([v,l])=> <option key={v} value={v}>{l}</option>)}
                </select></div>

              {/* times */}
              {(["startTime","endTime"] as const).map(n=>(
                <div key={n}>
                  <label className="block mb-1">{n==="startTime"?"Fillimi":"Mbarimi"}</label>
                  <input className="border p-1 rounded w-full text-center font-mono" inputMode="numeric"
                         value={toUi(watch(n)||"")} onChange={e=>setValue(n,DIG(e.target.value))}
                         placeholder="--:--"/>
                </div>
              ))}

              {/* academic year */}
              <div><label className="block mb-1">Viti Akademik</label>
                <select {...register("academicYearId")} className="border p-1 rounded w-full">
                  <option value="">Zgjidh vitin akademik</option>
                  {years.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}
                </select></div>

              {/* study year */}
              <div><label className="block mb-1">Viti Studimit</label>
                <input type="number" {...register("studyYear")}
                       className="border p-1 rounded w-full" placeholder="1‐3"/></div>

              {/* subject */}
              <div><label className="block mb-1">Lënda</label>
                <select {...register("subjectId")} className="border p-1 rounded w-full">
                  <option value="">Zgjidh lëndën</option>
                  {subjects.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></div>

              {/* instructor */}
              <div><label className="block mb-1">Profesori</label>
                <select {...register("instructorId")} className="border p-1 rounded w-full">
                  <option value="">Zgjidh profesorin</option>
                  {instructors.map(i=> <option key={i.id} value={i.id}>{i.name}</option>)}
                </select></div>

              {/* semester */}
              <div><label className="block mb-1">Semestri</label>
                <select {...register("semesterId")} className="border p-1 rounded w-full">
                  <option value="">Zgjidh semestrin</option>
                  {semesters.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></div>

              {/* room */}
              <div><label className="block mb-1">Salla</label>
                <select {...register("classLocationId")} className="border p-1 rounded w-full">
                  <option value="">Zgjidh sallën</option>
                  {locations.map(l=> <option key={l.id} value={l.id}>{l.roomName}</option>)}
                </select></div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded">Ruaj</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-1.5 rounded"
                        onClick={()=>setOpen(false)}>Anulo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesAdminPage;
