import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanelExams from "@/components/FilterPanelExams";
import { FilterOptionsexam } from "@/types";

/* ---------- dropdown models ---------- */
interface SubjectData    { id:string; name:string; code:string }
interface InstructorData { id:string; name:string; role:string }
interface AfatiData      { id:string; name:string }
interface AcademicYearItem{ id:string; name:string; isActive:boolean }

/* ---------- exam model ---------- */
interface ExamItem{
  id:string; eventType:string; academicYearId:string|null;
  studyYear:number; date:string; hour:string; afatiId:string;
  subjectId:string; instructorId:string;
  Subject?:{id:string;name:string};
  Instructor?:{id:string;name:string};
  Afati?:{id:string;name:string};
  AcademicYear?:{id:string;name:string};
}

/* ---------- helpers for time ---------- */
const maskDigits  = (raw:string)=>raw.replace(/\D/g,"").slice(0,4);
const maskDisplay = (digits:string)=>`${digits.padEnd(4,"-").slice(0,2)}:${digits.padEnd(4,"-").slice(2)}`;
const normalTime  = (d:string)=>{
  const digits=maskDigits(d); if(digits.length!==4) return d;
  const h=Math.min(Math.max(+digits.slice(0,2),0),23);
  const m=Math.min(Math.max(+digits.slice(2),0),59);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
};

/* ===================================================================== */
const ExamsAdminPage:React.FC=()=>{
  const [exams,setExams]                 = useState<ExamItem[]>([]);
  const [loading,setLoading]             = useState(false);
  const [editId,setEditId]               = useState<string|null>(null);
  const [showEditModal,setShowEditModal] = useState(false);

  const [subjects,setSubjects]       = useState<SubjectData[]>([]);
  const [instructors,setInstructors] = useState<InstructorData[]>([]);
  const [afatis,setAfatis]           = useState<AfatiData[]>([]);
  const [academicYears,setAcademicYears]=useState<AcademicYearItem[]>([]);

  const { register, handleSubmit, reset, setValue, watch } = useForm<any>();

  const [filters,setFilters] = useState<FilterOptionsexam>({
    academicYear:"", afati:"", yearOfStudy:"",
  });

  /* ---------------- data fetch ---------------- */
  const fetchExams = async()=>{
    setLoading(true);
    try{ const {data}=await axiosInstance.get<ExamItem[]>("/exams"); setExams(data);}
    catch(e){ console.error("fetchExams:",e);} finally{ setLoading(false);}
  };
  const fetchDropdownData = async()=>{
    try{
      const [s,i,a]=await Promise.all([
        axiosInstance.get<SubjectData[]>("/subjects"),
        axiosInstance.get<InstructorData[]>("/instructors"),
        axiosInstance.get<AfatiData[]>("/afati"),
      ]);
      setSubjects(s.data); setInstructors(i.data); setAfatis(a.data);
    }catch(e){ console.error("dropdown:",e);}
  };
  const fetchAcademicYears = async()=>{
    try{
      const {data}=await axiosInstance.get<AcademicYearItem[]>("/academic-year");
      setAcademicYears(data.filter(a=>a.isActive));
    }catch(e){ console.error("academicYears:",e);}
  };

  useEffect(()=>{ fetchExams(); fetchDropdownData(); fetchAcademicYears(); },[]);

  /* ---------------- filters ---------------- */
  const filteredExams = exams.filter(e=>{
    if(filters.academicYear && e.AcademicYear?.name!==filters.academicYear) return false;
    if(filters.afati && e.Afati?.name!==filters.afati) return false;
    if(filters.yearOfStudy){
      const num=parseInt(filters.yearOfStudy.replace(/\D/g,""),10);
      if(e.studyYear!==num) return false;
    }
    return true;
  });

  /* ---------------- edit logic ---------------- */
  const startEdit=(exam:ExamItem)=>{
    setEditId(exam.id);
    setValue("afatiId",exam.afatiId);
    setValue("academicYearId",exam.academicYearId||"");
    setValue("studyYear",String(exam.studyYear));
    setValue("date",exam.date);
    setValue("hour",exam.hour.replace(":",""));   // store digits only
    setValue("subjectId",exam.subjectId);
    setValue("instructorId",exam.instructorId);
    setShowEditModal(true);
  };
  const closeModal=()=>{ setEditId(null); reset({}); setShowEditModal(false); };

  const onSubmit=async(data:any)=>{
    if(!editId) return;
    try{
      await axiosInstance.put(`/exams/${editId}`,{
        eventType:"Provime",
        afatiId:data.afatiId,
        academicYearId:data.academicYearId,
        studyYear:+data.studyYear || 1,
        date:data.date,
        hour:normalTime(data.hour),
        subjectId:data.subjectId,
        instructorId:data.instructorId,
      });
      fetchExams(); closeModal();
    }catch(e){ console.error("update error:",e);}
  };

  const deleteExam=async(id:string)=>{
    if(!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë provim?")) return;
    try{ await axiosInstance.delete(`/exams/${id}`); fetchExams();}
    catch(e){ console.error("delete:",e);}
  };

  /* ------------------------------------------------------------------ */
  return(
    <div className="w-full px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-4">Menaxho Provime</h1>

      <div className="mb-6">
        <FilterPanelExams filters={filters} setFilters={setFilters}/>
      </div>

      {/* table */}
      <div className="bg-white p-4 rounded shadow w-full">
        <h2 className="text-lg font-semibold mb-3">Lista e Provimeve</h2>
        {loading?(
          <p>Po ngarkohet lista e provimeve...</p>
        ):(
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Afati</th>
                  <th className="p-2 text-left">Data / Ora</th>
                  <th className="p-2 text-left">Viti Akademik</th>
                  <th className="p-2 text-left">Viti Studimeve</th>
                  <th className="p-2 text-left">Lënda</th>
                  <th className="p-2 text-left">Profesori</th>
                  <th className="p-2 text-left">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map(exam=>(
                  <tr key={exam.id} className="border-b">
                    <td className="p-2">{exam.Afati?.name}</td>
                    <td className="p-2">{exam.date} / {normalTime(exam.hour)}</td>
                    <td className="p-2">{exam.AcademicYear?.name}</td>
                    <td className="p-2">{exam.studyYear}</td>
                    <td className="p-2">{exam.Subject?.name}</td>
                    <td className="p-2">{exam.Instructor?.name}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button onClick={()=>startEdit(exam)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Edito</button>
                        <button onClick={()=>deleteExam(exam.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Fshij</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredExams.length&&(
                  <tr><td colSpan={7} className="p-2 text-center text-gray-500">Asnjë provim nuk u gjet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* modal */}
      {showEditModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✕</button>
            <h2 className="text-lg font-semibold mb-4">Përditëso Provimin</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Afati */}
                <div>
                  <label className="block font-medium mb-1">Afati</label>
                  <select {...register("afatiId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh Afatin --</option>
                    {afatis.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                {/* Viti Akademik */}
                <div>
                  <label className="block font-medium mb-1">Viti Akademik</label>
                  <select {...register("academicYearId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh Vitin --</option>
                    {academicYears.map(ay=><option key={ay.id} value={ay.id}>{ay.name}</option>)}
                  </select>
                </div>
                {/* Viti studimeve */}
                <div>
                  <label className="block font-medium mb-1">Viti Studimeve</label>
                  <input type="number" {...register("studyYear")} className="border p-1 rounded w-full"/>
                </div>
                {/* Data */}
                <div>
                  <label className="block font-medium mb-1">Data e Provimit</label>
                  <input type="date" {...register("date")} className="border p-1 rounded w-full"/>
                </div>
                {/* Ora e provimit */}
                <div>
                  <label className="block font-medium mb-1">Ora e Provimit</label>
                  <input
                    type="text" inputMode="numeric" placeholder="--:--"
                    className="border p-1 rounded w-full text-center font-mono"
                    value={maskDisplay(maskDigits(watch("hour")||""))}
                    onChange={e=>setValue("hour",maskDigits(e.target.value))}
                    onKeyDown={e=>{
                      if(e.key==="Backspace"||e.key==="Delete"){
                        e.preventDefault();
                        setValue("hour",maskDigits((watch("hour")||"").slice(0,-1)));
                      }
                    }}
                    onBlur={()=>setValue("hour",maskDigits(watch("hour")||""))}
                  />
                </div>
                {/* Lënda */}
                <div>
                  <label className="block font-medium mb-1">Lënda</label>
                  <select {...register("subjectId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh Lëndën --</option>
                    {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {/* Profesori */}
                <div>
                  <label className="block font-medium mb-1">Profesori</label>
                  <select {...register("instructorId")} className="border p-1 rounded w-full">
                    <option value="">-- Zgjidh Profesorin --</option>
                    {instructors.map(i=><option key={i.id} value={i.id}>{i.name} ({i.role})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">Ruaj</button>
                <button type="button" onClick={closeModal} className="bg-gray-400 text-white px-4 py-1.5 rounded hover:bg-gray-500">Anulo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsAdminPage;
