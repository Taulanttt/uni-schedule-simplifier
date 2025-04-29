/* ExamsScheduleForm.tsx -------------------------------------------------- */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  ChevronsUpDown, Clock, Pencil, Trash, Trash2, UploadCloud,
} from "lucide-react";

import {
  Form, FormField, FormItem, FormLabel, FormMessage, FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/hooks/use-toast";

/* ---------------- validation ---------------- */
const formSchema = z.object({
  academicYearId:  z.string().min(1),
  studyYear:       z.string().min(1),
  afatiId:         z.string().min(1),
  subjectId:       z.string().min(1),
  instructorId:    z.string().min(1),
  date:            z.coerce.date(),
  hour:            z.string().min(1),
});
type FormValues = z.infer<typeof formSchema>;

/* ---------------- models ---------------- */
interface AcademicYearItem { id:string; name:string; isActive:boolean }
interface AfatiData        { id:string; name:string }
interface SubjectData      { id:string; name:string }
interface InstructorData   { id:string; name:string; role:string }

/* ---------------- constants ---------------- */
const LS_KEY = "examDrafts";

/* helpers: time --------------------------------------------------------- */
const maskDigits  = (raw:string)=>raw.replace(/\D/g,"").slice(0,4);
const maskDisplay = (d:string)=>`${d.padEnd(4,"-").slice(0,2)}:${d.padEnd(4,"-").slice(2)}`;
const normalTime  = (d:string)=>{
  const digits = maskDigits(d);
  if(digits.length!==4) return d;
  const h = Math.min(Math.max(+digits.slice(0,2),0),23);
  const m = Math.min(Math.max(+digits.slice(2),0),59);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
};

/* ====================================================================== */
const ExamsScheduleForm: React.FC = () => {
  /* dropdown data */
  const [academicYears,setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [afate,setAfate]                 = useState<AfatiData[]>([]);
  const [subjects,setSubjects]           = useState<SubjectData[]>([]);
  const [instructors,setInstructors]     = useState<InstructorData[]>([]);

  /* draft state */
  const [drafts,setDrafts]   = useState<FormValues[]>([]);
  const [editIdx,setEditIdx] = useState<number|null>(null);

  /* read / persist drafts */
  useEffect(()=>{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) setDrafts(JSON.parse(raw));
  },[]);
  useEffect(()=>localStorage.setItem(LS_KEY,JSON.stringify(drafts)),[drafts]);

  /* fetch data */
  useEffect(()=>{
    (async()=>{
      try{
        const [yrs,af,sub,inst] = await Promise.all([
          axiosInstance.get<AcademicYearItem[]>("/academic-year"),
          axiosInstance.get<AfatiData[]>("/afati"),
          axiosInstance.get<SubjectData[]>("/subjects"),
          axiosInstance.get<InstructorData[]>("/instructors"),
        ]);
        setAcademicYears(yrs.data.filter(a=>a.isActive));
        setAfate(af.data); setSubjects(sub.data); setInstructors(inst.data);
      }catch(e){ console.error(e); }
    })();
  },[]);

  /* form */
  const form = useForm<FormValues>({
    resolver:zodResolver(formSchema),
    defaultValues:{
      academicYearId:"",studyYear:"",afatiId:"",
      subjectId:"",instructorId:"",date:new Date(),hour:"",
    },
  });

  /* submit (→ draft) */
  const onSubmit = (d:FormValues)=>{
    if(editIdx!==null){
      setDrafts(prev=>{const cp=[...prev];cp[editIdx]=d;return cp;});
      setEditIdx(null);
      toast({title:"Drafti u përditësua"});
    }else{
      setDrafts(prev=>[...prev,d]);
      toast({title:"Drafti u shtua"});
    }
    form.reset();
  };

  /* draft helpers */
  const loadDraft   = (d:FormValues,i:number)=>{ form.reset(d); setEditIdx(i); };
  const removeDraft = (i:number)=>setDrafts(prev=>prev.filter((_,idx)=>idx!==i));
  const clearDrafts = ()=>{ setDrafts([]); toast({title:"Draftat u fshinë"}); };
  const publishAll  = async()=>{
    if(!drafts.length){ toast({title:"S'ka drafta"}); return;}
    try{
      for(const d of drafts){
        await axiosInstance.post("/exams",{
          eventType:"exam",
          academicYearId:d.academicYearId,
          studyYear:+d.studyYear,
          afatiId:d.afatiId,
          subjectId:d.subjectId,
          instructorId:d.instructorId,
          date:format(d.date,"yyyy-MM-dd"),
          hour:normalTime(d.hour),
        });
      }
      toast({title:"Publikuar me sukses"}); setDrafts([]);
    }catch(e){ console.error(e); toast({title:"Gabim gjatë publikimit",variant:"destructive"});}
  };

  /* ------------------------------------------------------------------ */
  return(
    <div className="w-full max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-md shadow">
      {/* header -- dialog drafts */}
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Cakto Provim</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Draftat ({drafts.length})</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Draftat e Provimeve</DialogTitle></DialogHeader>

            {drafts.length
              ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-6">
                  {drafts.map((d,i)=>(
                    <li key={i} className="border p-3 rounded text-sm flex justify-between">
                      <div>
                        <p className="font-medium">{subjects.find(s=>s.id===d.subjectId)?.name||"Lëndë"} – {normalTime(d.hour)}</p>
                        <p className="text-gray-600">{format(d.date,"dd/MM/yyyy")} • Viti {d.studyYear}</p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Button size="icon" variant="ghost" onClick={()=>loadDraft(d,i)} title="Edito">
                          <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={()=>removeDraft(i)} title="Fshij">
                          <Trash className="h-4 w-4"/>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
              : <p className="text-sm text-gray-500 mb-4">Nuk ka drafta.</p>
            }

            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" disabled={!drafts.length} onClick={clearDrafts}>
                <Trash2 className="h-4 w-4 mr-1"/>Fshi të gjitha
              </Button>
              <Button disabled={!drafts.length} onClick={publishAll}>
                <UploadCloud className="h-4 w-4 mr-1"/>Publiko të gjitha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* ------------------ FORM ------------------ */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Rreshti 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField name="academicYearId" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Viti Akademik</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Zgjidh"/></SelectTrigger></FormControl>
                  <SelectContent>{academicYears.map(a=><SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage/>
              </FormItem>
            )}/>
            <FormField name="studyYear" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Viti Studimeve</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Viti"/></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="1">Viti 1</SelectItem>
                    <SelectItem value="2">Viti 2</SelectItem>
                    <SelectItem value="3">Viti 3</SelectItem>
                  </SelectContent>
                </Select><FormMessage/>
              </FormItem>
            )}/>
            <FormField name="afatiId" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Afati</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Afati"/></SelectTrigger></FormControl>
                  <SelectContent>{afate.map(a=><SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage/>
              </FormItem>
            )}/>
          </div>

          {/* Rreshti 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="subjectId" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Lënda</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Lënda"/></SelectTrigger></FormControl>
                  <SelectContent>{subjects.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select><FormMessage/>
              </FormItem>
            )}/>
            <FormField name="instructorId" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Profesori</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Profesori"/></SelectTrigger></FormControl>
                  <SelectContent>{instructors.map(i=><SelectItem key={i.id} value={i.id}>{i.name} ({i.role})</SelectItem>)}</SelectContent>
                </Select><FormMessage/>
              </FormItem>
            )}/>
          </div>

          {/* Rreshti 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="date" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Data e Provimit</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={format(field.value,"yyyy-MM-dd")}
                    onChange={e=>field.onChange(new Date(e.target.value))}
                  />
                </FormControl><FormMessage/>
              </FormItem>
            )}/>
            <FormField name="hour" control={form.control} render={({field})=>(
              <FormItem><FormLabel>Ora e Provimit</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="text" inputMode="numeric" placeholder="--:--"
                      className="pl-10 text-center font-normal"
                      value={maskDisplay(maskDigits(field.value||""))}
                      onChange={e=>field.onChange(maskDigits(e.target.value))}
                      onKeyDown={e=>{
                        if(e.key==="Backspace"||e.key==="Delete"){
                          e.preventDefault();
                          field.onChange(maskDigits((field.value||"").slice(0,-1)));
                        }
                      }}
                      onBlur={()=>field.onChange(maskDigits(field.value||""))}
                    />
                  </FormControl>
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"/>
                </div>
                <FormMessage/>
              </FormItem>
            )}/>
          </div>

          <Button type="submit">{editIdx!==null?"Ruaj Ndryshimet":"Shto në Draft"}</Button>
        </form>
      </Form>
    </div>
  );
};

export default ExamsScheduleForm;
