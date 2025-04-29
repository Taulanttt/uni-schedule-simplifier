/* SchedulesAdminPage.tsx ------------------------------------------------- */
import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanel from "@/components/FilterPanel";

/* ---------- types ---------- */
interface FilterOptions {
  academicYear: string;
  semester:     string;
  yearOfStudy:  string;
}
interface ScheduleItem {
  id: string;
  eventType: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  academicYearId: string|null;
  studyYear: number;
  subjectName: string;
  instructorName: string;
  semesterName: string;
  locationName: string;
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
}
interface SubjectData       { id:string; name:string; code:string }
interface InstructorData    { id:string; name:string; role:string }
interface SemesterData      { id:string; name:string }
interface ClassLocationData { id:string; roomName:string }
interface AcademicYearItem  { id:string; name:string; isActive:boolean }

/* ---------- constants ---------- */
const DAY_OPTIONS = [
  { value:"Monday",    label:"E hënë"    },
  { value:"Tuesday",   label:"E martë"   },
  { value:"Wednesday", label:"E mërkurë" },
  { value:"Thursday",  label:"E enjte"   },
  { value:"Friday",    label:"E premte"  },
  { value:"Saturday",  label:"E shtunë"  },
  { value:"Sunday",    label:"E diel"    },
] as const;
const DAY_LABELS:Record<string,string> = DAY_OPTIONS.reduce(
  (acc,c)=>({ ...acc,[c.value]:c.label }),{}
);

/* ---------- time helpers ---------- */
const maskToDigits = (raw:string) => raw.replace(/\D/g,"").slice(0,4);       // HHMM
const toPgTime     = (digitsOrVal:string) => {                               // HH:MM:00
  const d = maskToDigits(digitsOrVal).padEnd(4,"0");
  const h = d.slice(0,2), m = d.slice(2);
  return `${h}:${m}:00`;
};
const uiMask = (digits:string) => `${digits.padEnd(4,"-").slice(0,2)}:${digits.padEnd(4,"-").slice(2)}`;

/* ---------- main page ---------- */
const SchedulesAdminPage:React.FC = () => {
  /* data state */
  const [schedules,setSchedules] = useState<ScheduleItem[]>([]);
  const [subjects,setSubjects]   = useState<SubjectData[]>([]);
  const [instructors,setInstructors] = useState<InstructorData[]>([]);
  const [semesters,setSemesters] = useState<SemesterData[]>([]);
  const [locations,setLocations] = useState<ClassLocationData[]>([]);
  const [academicYears,setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [loading,setLoading] = useState(false);

  /* UI/logic state */
  const [filters,setFilters] = useState<FilterOptions>({ academicYear:"",semester:"",yearOfStudy:"" });
  const [editId,setEditId]   = useState<string|null>(null);
  const [showEdit,setShowEdit] = useState(false);

  /* form */
  const { register, handleSubmit, setValue, reset, watch } = useForm<any>();

  /* ---------- fetch ---------- */
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
        setSchedules(res.data);
      }catch(e){ console.error(e);}finally{ setLoading(false); }
      try{
        const [sub,ins,sem,loc,yrs] = await Promise.all([
          axiosInstance.get<SubjectData[]>("/subjects"),
          axiosInstance.get<InstructorData[]>("/instructors"),
          axiosInstance.get<SemesterData[]>("/semesters"),
          axiosInstance.get<ClassLocationData[]>("/class-locations"),
          axiosInstance.get<AcademicYearItem[]>("/academic-year"),
        ]);
        setSubjects(sub.data); setInstructors(ins.data);
        setSemesters(sem.data); setLocations(loc.data);
        setAcademicYears(yrs.data.filter(a=>a.isActive));
      }catch(e){ console.error(e); }
    })();
  },[]);

  /* ---------- filters ---------- */
  const filtered = schedules.filter(s=>{
    const yearName = academicYears.find(a=>a.id===s.academicYearId)?.name;
    if(filters.academicYear && filters.academicYear!==yearName) return false;
    if(filters.semester && filters.semester!==s.semesterName) return false;
    if(filters.yearOfStudy){
      if(s.studyYear!==+filters.yearOfStudy.replace(/\D/g,"")) return false;
    }
    return true;
  });

  /* ---------- edit helpers ---------- */
  const startEdit = (s:ScheduleItem)=>{
    setEditId(s.id);
    reset({
      eventType:s.eventType,
      daysOfWeek:s.daysOfWeek,
      startTime:maskToDigits(s.startTime),            // 0830
      endTime:  maskToDigits(s.endTime),
      academicYearId:s.academicYearId||"",
      studyYear:String(s.studyYear),
      subjectId:s.subjectId,
      instructorId:s.instructorId,
      semesterId:s.semesterId,
      classLocationId:s.classLocationId,
    });
    setShowEdit(true);
  };
  const closeEdit = ()=>{ setEditId(null); reset({}); setShowEdit(false); };

  /* ---------- delete ---------- */
  const deleteSchedule = async(id:string)=>{
    if(!confirm("A jeni i sigurt që dëshironi ta fshini këtë orar?")) return;
    try{ await axiosInstance.delete(`/schedules/${id}`); setSchedules(p=>p.filter(x=>x.id!==id)); }
    catch(e){ console.error(e); }
  };

  /* ---------- submit ---------- */
  const onSubmit = async(data:any)=>{
    if(!editId) return;
    const payload = {
      eventType:data.eventType,
      startTime:toPgTime(data.startTime),
      endTime:  toPgTime(data.endTime),
      daysOfWeek:Array.isArray(data.daysOfWeek)?data.daysOfWeek:[data.daysOfWeek],
      academicYearId:data.academicYearId,
      studyYear:+data.studyYear,
      subjectId:data.subjectId,
      instructorId:data.instructorId,
      semesterId:data.semesterId,
      classLocationId:data.classLocationId,
    };
    try{
      await axiosInstance.put(`/schedules/${editId}`,payload);
      setSchedules(p=>p.map(x=>x.id===editId ? {...x,...payload,startTime:payload.startTime.slice(0,5),endTime:payload.endTime.slice(0,5)} : x));
      closeEdit();
    }catch(e){ console.error(e); }
  };

  /* ---------- little lookup util ---------- */
  const lookup = (id:string, arr:{id:string;name:string}[]) => arr.find(x=>x.id===id)?.name||"—";

  /* ======================== UI ======================== */
  return (
    <div className="w-full px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-4">Menaxho Orare</h1>
      <div className="mb-6"><FilterPanel filters={filters} setFilters={setFilters}/></div>

      <div className="bg-white p-4 rounded shadow w-full">
        <h2 className="text-lg font-semibold mb-3">Të Gjitha Oraret</h2>
        {loading?(<p>Po ngarkohet...</p>):(
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  {["Lloji","Ora","Ditët","Viti Ak.","Viti Stud.","Lënda","Profesori","Semestri","Salla","Veprime"]
                    .map(h=><th key={h} className="p-2 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s=>{
                  const yr=lookup(s.academicYearId||"",academicYears);
                  return(
                    <tr key={s.id} className="border-b">
                      <td className="p-2">{s.eventType}</td>
                      <td className="p-2">{s.startTime} - {s.endTime}</td>
                      <td className="p-2">{s.daysOfWeek.map(d=>DAY_LABELS[d]||d).join(", ")}</td>
                      <td className="p-2">{yr}</td>
                      <td className="p-2">{s.studyYear}</td>
                      <td className="p-2">{s.subjectName}</td>
                      <td className="p-2">{s.instructorName}</td>
                      <td className="p-2">{s.semesterName}</td>
                      <td className="p-2">{s.locationName}</td>
                      <td className="p-2">
                        <button onClick={()=>startEdit(s)} className="bg-blue-600 text-white px-2 py-1 rounded mr-1">Edito</button>
                        <button onClick={()=>deleteSchedule(s.id)} className="bg-red-600 text-white px-2 py-1 rounded">Fshij</button>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && <tr><td colSpan={10} className="p-2 text-center text-gray-500">Asnjë orar nuk u gjet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- Edit Modal ---------------- */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white max-w-2xl w-full p-6 rounded shadow relative">
            <button onClick={closeEdit} className="absolute top-2 right-2 text-gray-600 text-xl leading-none">×</button>
            <h2 className="text-lg font-semibold mb-4">Edito Orarin</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* eventType */}
                <div><label className="block mb-1">Lloji i Ngjarjes</label>
                  <input {...register("eventType")} className="border p-1 rounded w-full"/></div>

                {/* daysOfWeek (simple select) */}
                <div><label className="block mb-1">Dita e Javës</label>
                  <select {...register("daysOfWeek")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh --</option>
                    {DAY_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select></div>

                {/* time inputs (component) */}
                {(["startTime","endTime"] as const).map(name=>(
                  <div key={name}>
                    <label className="block mb-1">{name==="startTime"?"Ora e Fillimit":"Ora e Përfundimit"}</label>
                    <input
                      type="text" inputMode="numeric" placeholder="--:--"
                      className="border p-1 rounded w-full text-center font-mono"
                      value={uiMask(watch(name)||"")}
                      onChange={e=>setValue(name,maskToDigits(e.target.value))}
                      onKeyDown={e=>{
                        if(e.key==="Backspace"||e.key==="Delete"){
                          e.preventDefault();
                          setValue(name,maskToDigits(watch(name).slice(0,-1)));
                        }
                      }}
                      onBlur={()=>setValue(name,maskToDigits(watch(name)))}
                    />
                  </div>
                ))}

                {/* academic year */}
                <div><label className="block mb-1">Viti Akademik</label>
                  <select {...register("academicYearId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh --</option>
                    {academicYears.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                  </select></div>

                {/* study year */}
                <div><label className="block mb-1">Viti i Studimeve</label>
                  <input type="number" {...register("studyYear")} className="border p-1 rounded w-full"/></div>

                {/* subject */}
                <div><label className="block mb-1">Lënda</label>
                  <select {...register("subjectId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh --</option>
                    {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>

                {/* instructor */}
                <div><label className="block mb-1">Profesori</label>
                  <select {...register("instructorId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh --</option>
                    {instructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                  </select></div>

                {/* semester */}
                <div><label className="block mb-1">Semestri</label>
                  <select {...register("semesterId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh --</option>
                    {semesters.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>

                {/* location */}
                <div><label className="block mb-1">Salla</label>
                  <select {...register("classLocationId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh --</option>
                    {locations.map(l=><option key={l.id} value={l.id}>{l.roomName}</option>)}
                  </select></div>
              </div>

              <div className="space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded">Ruaj</button>
                <button type="button" onClick={closeEdit} className="bg-gray-400 text-white px-4 py-1.5 rounded">Anulo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesAdminPage;
