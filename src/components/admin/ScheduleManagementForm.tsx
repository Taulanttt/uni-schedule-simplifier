/* -------------------------------------------------------------- */
/*  ScheduleManagementForm.tsx – create → local-draft → publish   */
/* -------------------------------------------------------------- */
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form, FormField, FormItem, FormLabel, FormMessage, FormControl,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
 import { Button }            from "@/components/ui/button";
 import { Input }             from "@/components/ui/input";
 import { Checkbox }          from "@/components/ui/checkbox";
 import { Dialog, DialogTrigger,
          DialogContent, DialogHeader,
          DialogTitle, DialogFooter } from "@/components/ui/dialog";
 import { Popover, PopoverTrigger,
          PopoverContent }     from "@/components/ui/popover";
import { ChevronsUpDown, Pencil, Trash, Trash2, UploadCloud } from "lucide-react";

import axios from "@/utils/axiosInstance";
import { useToast } from "@/hooks/use-toast";

/* ----------------- helpers ----------------- */
const mask = (raw: string) => raw.replace(/\D/g, "").slice(0, 4);
const toUi = (d: string) => `${d.padEnd(4, "-").slice(0, 2)}:${d.padEnd(4, "-").slice(2)}`;
const normal = (v: string) => {
  const d = mask(v);
  if (d.length !== 4) return v;
  return `${d.slice(0, 2)}:${d.slice(2)}:00`;
};

/* ----------------- zod schema --------------- */
const schema = z.object({
  academicYearId:  z.string().min(1),
  studyYear:       z.enum(["1", "2", "3"]),
  semesterId:      z.string().min(1),
  subjectId:       z.string().min(1),
  instructorId:    z.string().min(1),
  eventType:       z.string().min(1),
  classLocationId: z.string().min(1),
  startTime:       z.string().min(4),
  endTime:         z.string().min(4),
  daysOfWeek:      z.array(z.enum([
    "E Hënë", "E Martë", "E Mërkurë", "E Enjte",
    "E Premte", "E Shtunë", "E Diel",
  ])).min(1),
});
type FormValues = z.infer<typeof schema>;

/* ----------------- constants ---------------- */
const LS = "scheduleDrafts";
const uiDays = [
  "E Hënë","E Martë","E Mërkurë","E Enjte",
  "E Premte","E Shtunë","E Diel",
] as const;
const apiDay: Record<string, string> = {
  "E Hënë":"Monday","E Martë":"Tuesday","E Mërkurë":"Wednesday",
  "E Enjte":"Thursday","E Premte":"Friday","E Shtunë":"Saturday","E Diel":"Sunday",
};

/* ----------------- component ---------------- */
const ScheduleManagementForm: React.FC = () => {
  /* ------------- toast & form ------------- */
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      academicYearId:"", studyYear:"1", semesterId:"",
      subjectId:"", instructorId:"", eventType:"",
      classLocationId:"", startTime:"", endTime:"",
      daysOfWeek:[],
    },
  });

  /* ------------- dropdown data ------------ */
  const [subjects,       setSubjects]       = useState<{id:string;name:string}[]>([]);
  const [instructors,    setInstructors]    = useState<{id:string;name:string}[]>([]);
  const [semesters,      setSemesters]      = useState<{id:string;name:string}[]>([]);
  const [locations,      setLocations]      = useState<{id:string;roomName:string}[]>([]);
  const [academicYears,  setAcademicYears]  = useState<{id:string;name:string}[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [sub, inst, sem, loc, yr] = await Promise.all([
          axios.get("/subjects"),
          axios.get("/instructors"),
          axios.get("/semesters"),
          axios.get("/class-locations"),
          axios.get("/academic-year"),
        ]);
        setSubjects(sub.data);
        setInstructors(inst.data);
        setSemesters(sem.data);
        setLocations(loc.data);
        setAcademicYears((yr.data as any[]).filter(a => a.isActive));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  /* ------------- local drafts ------------- */
  const [drafts, setDrafts]         = useState<FormValues[]>([]);
  const [editing, setEditing]       = useState<number | null>(null);

  useEffect(() => {                 // load
    const raw = localStorage.getItem(LS);
    if (raw) setDrafts(JSON.parse(raw));
  }, []);
  useEffect(() => {                 // persist
    localStorage.setItem(LS, JSON.stringify(drafts));
  }, [drafts]);

  /* ------------- helpers ------------------ */
  const resetForm = () => {
    setEditing(null);
    form.reset();
  };

  /* ------------- submit ------------------- */
  const onSubmit = (data: FormValues) => {
    if (editing !== null) {
      setDrafts(d => { const cp=[...d]; cp[editing]=data; return cp; });
      toast({ title:"Drafti u përditësua" });
    } else {
      setDrafts(d => [...d, data]);
      toast({ title:"U shtua në drafta" });
    }
    resetForm();
  };

  /* ------------- publish ------------------ */
  const publishAll = async () => {
    if (!drafts.length) { toast({ title:"S'ka drafta" }); return; }

    try {
      await Promise.all(drafts.map(d =>
        axios.post("/schedules", {
          ...d,
          studyYear: +d.studyYear,
          startTime: normal(d.startTime),
          endTime  : normal(d.endTime),
          daysOfWeek: d.daysOfWeek.map(dw => apiDay[dw]),
          status: "draft",                    // <- let BE keep it a draft
        })
      ));
      toast({ title:"U ngarkuan në server (status=draft)" });
      setDrafts([]);
      resetForm();
    } catch (e) {
      console.error(e);
      toast({ title:"Gabim gjatë publikimit", variant:"destructive" });
    }
  };

  /* ======================= JSX ======================= */
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow w-full">
      {/* Header --------------------------------------- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Krijo Orare</h2>

        {/* Draft Dialog ------------------------------ */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Draftat ({drafts.length})</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Draftat Lokale</DialogTitle></DialogHeader>

            {drafts.length ? (
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-6">
                {drafts.map((d, i) =>
                  <li key={i} className="border rounded p-3 flex justify-between text-sm">
                    <div className="space-y-0.5">
                      <p className="font-medium">{d.eventType}</p>
                      <p className="text-gray-600">{toUi(d.startTime)}-{toUi(d.endTime)} • {d.daysOfWeek.join(", ")}</p>
                      <p className="text-gray-600">
                        <b>Lënda:</b> {subjects.find(s=>s.id===d.subjectId)?.name||"—"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="icon" variant="ghost" onClick={()=>{ form.reset(d); setEditing(i); }}>
                        <Pencil className="h-4 w-4"/>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={()=>setDrafts(ds=>ds.filter((_,idx)=>idx!==i))}>
                        <Trash className="h-4 w-4"/>
                      </Button>
                    </div>
                  </li>
                )}
              </ul>
            ) : <p className="text-sm text-gray-500 mb-4">Nuk ka asnjë draft.</p> }

            <DialogFooter className="sm:justify-between">
              <Button
                variant="destructive"
                disabled={!drafts.length}
                onClick={()=>setDrafts([])}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4"/> Fshi&nbsp;të&nbsp;gjitha
              </Button>

              <Button
                disabled={!drafts.length}
                onClick={publishAll}
                className="gap-2"
              >
                <UploadCloud className="h-4 w-4"/> Ngarko në Server
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Form ---------------------------------------- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Row 1 */}
          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              name="academicYearId" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viti Akademik</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Zgjidh vitin" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {academicYears.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              name="studyYear" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viti Studimit</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Viti" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="1">Viti 1</SelectItem>
                      <SelectItem value="2">Viti 2</SelectItem>
                      <SelectItem value="3">Viti 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              name="semesterId" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semestri</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Semestri" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {semesters.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              name="subjectId" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lënda</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Lënda" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              name="instructorId" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesori</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Profesori" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>

          {/* Row 3 */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              name="eventType" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lloji</FormLabel>
                  <FormControl><Input placeholder="p.sh. Ligjëratë" {...field} /></FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              name="classLocationId" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salla</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Salla" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.roomName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>

          {/* Row 4 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* times */}
            <div className="grid md:grid-cols-2 gap-6">
              {(["startTime","endTime"] as const).map(name => (
                <FormField
                  key={name} name={name} control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{name==="startTime"?"Fillimi":"Mbarimi"}</FormLabel>
                      <FormControl>
                        <input
                          className="w-full border rounded px-3 py-2 text-center font-mono"
                          placeholder="--:--"
                          type="text" inputMode="numeric"
                          value={toUi(field.value)}
                          onChange={e=>field.onChange(mask(e.target.value))}
                          onBlur={() => field.onChange(mask(field.value))}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* days */}
            <FormField
              name="daysOfWeek" control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ditët</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {field.value.length ? field.value.join(", ") : "Zgjidh ditët"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50"/>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 space-y-2">
                      {uiDays.map(d => {
                        const checked = field.value.includes(d);
                        return (
                          <FormItem key={d} className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) =>
                                  c
                                    ? field.onChange([...field.value, d])
                                    : field.onChange(field.value.filter(v => v !== d))
                                }
                              />
                            </FormControl>
                            <span className="text-sm">{d}</span>
                          </FormItem>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>

          {/* buttons */}
          <div className="flex justify-end">
            <Button type="submit">{editing !== null ? "Ruaj" : "Shto në Draft"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ScheduleManagementForm;
