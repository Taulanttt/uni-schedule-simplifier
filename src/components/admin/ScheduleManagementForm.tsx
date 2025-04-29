/* ScheduleManagementForm.tsx */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormField, FormItem, FormLabel, FormMessage, FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronsUpDown, Trash, UploadCloud, Pencil, Trash2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Label } from "@radix-ui/react-label";

/* ---------------- TYPES & CONSTANTS ---------------- */
const formSchema = z.object({
  academicYearId:  z.string().min(1),
  studyYear:       z.string().min(1),
  semesterId:      z.string().min(1),
  subjectId:       z.string().min(1),
  instructorId:    z.string().min(1),
  eventType:       z.string().min(1),
  classLocationId: z.string().min(1),
  startTime:       z.string().min(1),
  endTime:         z.string().min(1),
  daysOfWeek:      z.array(z.string()).min(1),
});
type FormValues = z.infer<typeof formSchema>;

interface Simple      { id:string; name:string }
interface Location    { id:string; roomName:string }
interface Academic    { id:string; name:string; isActive:boolean }

const LS_KEY = "scheduleDrafts";
const dayMap:Record<string,string>={
  "E Hënë":"Monday","E Martë":"Tuesday","E Mërkurë":"Wednesday",
  "E Enjte":"Thursday","E Premte":"Friday","E Shtunë":"Saturday","E Diel":"Sunday",
};

/* -------- helper: mask & normalise time -------- */
const formatMaskedTime = (raw:string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);           // HHMM only
  const padded = digits.padEnd(4, "-");
  return `${padded.slice(0, 2)}:${padded.slice(2)}`;           // HH:MM
};
const normalizeTime = (v:string) => {
  const d=v.replace(/\D/g,"");
  if(d.length!==4) return v;
  const h=Math.min(Math.max(+d.slice(0,2),0),23);
  const m=Math.min(Math.max(+d.slice(2),0),59);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
};

/* =================================================== */
const ScheduleManagementForm:React.FC = () => {
  const { toast } = useToast();

  /* ---------- dropdown state ---------- */
  const [subjects,setSubjects]       = useState<Simple[]>([]);
  const [instructors,setInstructors] = useState<Simple[]>([]);
  const [semesters,setSemesters]     = useState<Simple[]>([]);
  const [locations,setLocations]     = useState<Location[]>([]);
  const [academicYears,setAcademicYears] = useState<Academic[]>([]);

  /* ---------- drafts state ---------- */
  const [drafts,setDrafts] = useState<FormValues[]>([]);
  const [editIndex,setEditIndex] = useState<number|null>(null);

  /* read & persist drafts */
  useEffect(()=>{ const raw=localStorage.getItem(LS_KEY); raw&&setDrafts(JSON.parse(raw)); },[]);
  useEffect(()=>{ localStorage.setItem(LS_KEY,JSON.stringify(drafts)); },[drafts]);

  /* fetch dropdown data */
  useEffect(()=>{
    (async()=>{
      try{
        const [sub,inst,sem,loc] = await Promise.all([
          axiosInstance.get<Simple[]>("/subjects"),
          axiosInstance.get<Simple[]>("/instructors"),
          axiosInstance.get<Simple[]>("/semesters"),
          axiosInstance.get<Location[]>("/class-locations"),
        ]);
        setSubjects(sub.data); setInstructors(inst.data);
        setSemesters(sem.data); setLocations(loc.data);
      }catch(e){ console.error(e); }
    })();
    (async()=>{
      try{
        const res=await axiosInstance.get<Academic[]>("/academic-year");
        setAcademicYears(res.data.filter(a=>a.isActive));
      }catch(e){ console.error(e); }
    })();
  },[]);

  /* ----------- react-hook-form ----------- */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      academicYearId:"",studyYear:"",semesterId:"",
      subjectId:"",instructorId:"",eventType:"",
      classLocationId:"",startTime:"",endTime:"",daysOfWeek:[],
    },
  });

  /* helpers */
  const lookup=(id:string,arr:{id:string;name:string}[])=>arr.find(x=>x.id===id)?.name||"—";
  const roomOf=(id:string)=>locations.find(l=>l.id===id)?.roomName||"—";

  /* submit */
  const onSubmit=(d:FormValues)=>{
    if(editIndex!==null){
      setDrafts(prev=>{ const cp=[...prev]; cp[editIndex]=d; return cp; });
      setEditIndex(null); toast({title:"Drafti u përditësua"});
    }else{
      setDrafts(prev=>[...prev,d]); toast({title:"U shtua në drafta"});
    }
    form.reset();
  };

  const removeDraft =(i:number)=>setDrafts(prev=>prev.filter((_,idx)=>idx!==i));
  const clearDrafts =()=>{ setDrafts([]); toast({title:"Draftat u fshinë"}); };
  const loadToForm  =(d:FormValues,i:number)=>{ form.reset(d); setEditIndex(i); };

  const publishAll = async()=>{
    if(!drafts.length){ toast({title:"S'ka drafta"}); return;}
    try{
      for(const d of drafts){
        await axiosInstance.post("/schedules",{
          ...d,
          studyYear:+d.studyYear,
          daysOfWeek:d.daysOfWeek.map(dw=>dayMap[dw]||dw),
        });
      }
      toast({title:"Publikuar me sukses"});
      setDrafts([]);
    }catch(e){ console.error(e); toast({title:"Gabim gjatë publikimit",variant:"destructive"}); }
  };

  /* ========================= UI ========================= */
  return(
    <div className="bg-white p-4 md:p-6 rounded-lg shadow w-full">
      {/* ---------- Header + Draft dialog ---------- */}
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Krijo Orare</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Shiko Draftat ({drafts.length})</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Draftat e Orareve</DialogTitle></DialogHeader>

            {drafts.length ? (
              <ul className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                {drafts.map((d,i)=>(
                  <li key={i} className="border rounded p-3 text-sm flex justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">{d.eventType}</p>
                      <p className="text-gray-600">{d.startTime}-{d.endTime} • {d.daysOfWeek.join(", ")}</p>
                      <p className="text-gray-600"><b>Lënda:</b> {lookup(d.subjectId,subjects)}</p>
                      <p className="text-gray-600"><b>Profesori:</b> {lookup(d.instructorId,instructors)}</p>
                      <p className="text-gray-600"><b>Semestri:</b> {lookup(d.semesterId,semesters)} | <b>Viti:</b> {d.studyYear}</p>
                      <p className="text-gray-600"><b>Salla:</b> {roomOf(d.classLocationId)} | <b>Viti ak.:</b> {lookup(d.academicYearId,academicYears)}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button size="icon" variant="ghost" title="Ngarko" onClick={()=>loadToForm(d,i)}>
                        <Pencil className="h-4 w-4"/>
                      </Button>
                      <Button size="icon" variant="ghost" title="Fshij" onClick={()=>removeDraft(i)}>
                        <Trash className="h-4 w-4"/>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Nuk ka asnjë draft.</p>
            )}

            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" disabled={!drafts.length} onClick={clearDrafts} className="gap-1">
                <Trash2 className="h-4 w-4"/> Fshi&nbsp;të&nbsp;gjitha
              </Button>

              <Button disabled={!drafts.length} onClick={publishAll} className="gap-2">
                <UploadCloud className="h-4 w-4" /> Publiko të gjitha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* --------------------- FORM --------------------- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ----- Row 1 ----- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField name="academicYearId" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Viti Akademik</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Zgjidh vitin"/></SelectTrigger></FormControl>
                  <SelectContent>{academicYears.map(ay=><SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}/>
            <FormField name="studyYear" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Viti i Studimit</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Viti"/></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="1">Viti 1</SelectItem>
                    <SelectItem value="2">Viti 2</SelectItem>
                    <SelectItem value="3">Viti 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}/>
            <FormField name="semesterId" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Semestri</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Semestri"/></SelectTrigger></FormControl>
                  <SelectContent>{semesters.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}/>
          </div>

          {/* ----- Row 2 ----- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField name="subjectId" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Lënda</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Lënda"/></SelectTrigger></FormControl>
                  <SelectContent>{subjects.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}/>
            <FormField name="instructorId" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Profesori</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Profesori"/></SelectTrigger></FormControl>
                  <SelectContent>{instructors.map(i=><SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}/>
          </div>

          {/* ----- Row 3 ----- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField name="eventType" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Lloji i Orës</FormLabel>
                <FormControl><Input placeholder="p.sh. Ligjëratë" {...field}/></FormControl>
                <FormMessage/>
              </FormItem>
            )}/>
            <FormField name="classLocationId" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Salla</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Salla"/></SelectTrigger></FormControl>
                  <SelectContent>{locations.map(l=><SelectItem key={l.id} value={l.id}>{l.roomName}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}/>
          </div>

          {/* ----- Row 4 ----- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["startTime","endTime"] as const).map(name=>(
                <FormField key={name} name={name} control={form.control} render={({field})=>(
                  <FormItem>
                    <FormLabel>{name==="startTime"?"Fillimi":"Mbarimi"}</FormLabel>
                    <FormControl>
                      <input
                        type="text" inputMode="numeric" placeholder="--:--"
                        className="w-full border rounded-md px-3 py-2 text-center font-mono"
                        value={formatMaskedTime(field.value)}
                        onChange={(e)=>field.onChange(e.target.value.replace(/\D/g,"").slice(0,4))}
                        onKeyDown={(e)=>{
                          if(e.key==="Backspace"){ e.preventDefault();
                            const digits=field.value.replace(/\D/g,"").slice(0,-1);
                            field.onChange(digits);
                          }
                          if(e.key==="Delete"){ e.preventDefault(); field.onChange(""); }
                        }}
                        onBlur={()=>field.onChange(normalizeTime(field.value))}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
              ))}
            </div>

            {/* Days */}
            <FormField name="daysOfWeek" control={form.control} render={({field})=>(
              <FormItem>
                <FormLabel>Ditët</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value.length?field.value.join(", "):"Zgjidh ditët"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2 space-y-2">
                    {["E Hënë","E Martë","E Mërkurë","E Enjte","E Premte","E Shtunë","E Diel"].map(day=>{
                      const checked=field.value.includes(day);
                      return(
                        <FormItem key={day} className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c)=>c
                                ?field.onChange([...field.value,day])
                                :field.onChange(field.value.filter(d=>d!==day))
                              }
                            />
                          </FormControl>
                          <Label className="text-sm">{day}</Label>
                        </FormItem>
                      );
                    })}
                  </PopoverContent>
                </Popover>
                <FormMessage/>
              </FormItem>
            )}/>
          </div>

          {/* submit */}
          <div className="flex justify-end">
            <Button type="submit">
              {editIndex!==null?"Ruaj Ndryshimet":"Shto në Draft"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ScheduleManagementForm;
