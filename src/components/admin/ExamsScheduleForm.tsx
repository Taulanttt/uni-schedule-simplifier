import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/hooks/use-toast";

// 1) Validimi me "academicYearId" dhe "afatiId"
const formSchema = z.object({
  academicYearId: z.string().min(1, "Viti akademik është i detyrueshëm"),
  studyYear: z.string().min(1, "Viti i studimeve është i detyrueshëm"),
  afatiId: z.string().min(1, "Afati është i detyrueshëm"),
  subjectId: z.string().min(1, "Lënda është e detyrueshme"),
  instructorId: z.string().min(1, "Profesori është i detyrueshëm"),
  date: z.coerce.date({ required_error: "Ju lutem zgjidhni një datë." }),
  hour: z.string().min(1, "Ju lutem zgjidhni një orë."),
});
type FormValues = z.infer<typeof formSchema>;

// 2) Modelet
interface AcademicYearItem {
  id: string; // UUID
  name: string;
  isActive: boolean;
}
interface AfatiData {
  id: string; // UUID
  name: string;
}
interface SubjectData {
  id: string;
  name: string;
}
interface InstructorData {
  id: string;
  name: string;
  role: string;
}

const ExamsScheduleForm: React.FC = () => {
  // 3) Ruajmë listat (vitet akademike, afatet, etj.)
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [afatiList, setAfatiList] = useState<AfatiData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);

  // 4) Hook form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYearId: "",
      studyYear: "",
      afatiId: "",
      subjectId: "",
      instructorId: "",
      date: new Date(),
      hour: "",
    },
  });

  // 5) Marrim "academic-year" -> filtruar me isActive
  useEffect(() => {
    async function fetchAcademicYears() {
      try {
        const res = await axiosInstance.get<AcademicYearItem[]>("/academic-year");
        const activeOnly = res.data.filter((ay) => ay.isActive);
        setAcademicYears(activeOnly);
      } catch (err) {
        console.error("Gabim tek academic-year:", err);
      }
    }
    fetchAcademicYears();
  }, []);

  // 6) Marrim "afati, subjects, instructors"
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        // Afati
        const afRes = await axiosInstance.get<AfatiData[]>("/afati");
        setAfatiList(afRes.data);

        // Lëndët
        const subRes = await axiosInstance.get<SubjectData[]>("/subjects");
        setSubjects(subRes.data);

        // Profesorët
        const insRes = await axiosInstance.get<InstructorData[]>("/instructors");
        setInstructors(insRes.data);
      } catch (error) {
        console.error("Gabim tek fetchDropdownData:", error);
      }
    }
    fetchDropdownData();
  }, []);

  // 7) Submit -> POST /exams
  const onSubmit = async (data: FormValues) => {
    try {
      // Ndërto request
      const reqBody = {
        eventType: "exam",
        academicYearId: data.academicYearId, // uuid
        studyYear: Number(data.studyYear),
        date: format(data.date, "yyyy-MM-dd"), // "YYYY-MM-DD"
        hour: data.hour,
        afatiId: data.afatiId,         // uuid
        subjectId: data.subjectId,     // uuid
        instructorId: data.instructorId, // uuid
      };

      await axiosInstance.post("/exams", reqBody);
      toast({ title: "Provimi u shtua me sukses!" });
      form.reset();
    } catch (err) {
      console.error("Gabim gjatë shtimit të provimit:", err);
      toast({
        title: "Gabim gjatë shtimit të provimit",
        description: "Ju lutem kontrolloni konsolën ose provoni përsëri.",
        variant: "destructive",
      });
    }
  };
  const formatMaskedTime = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 4);
    const chars = cleaned.split("");
    return `${chars[0] ?? "-"}${chars[1] ?? "-"}:${chars[2] ?? "-"}${chars[3] ?? "-"}`;
  };
  
  const normalizeTime = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length !== 4) return val;
    const hour = Math.min(Math.max(parseInt(digits.slice(0, 2)), 0), 23);
    const minute = Math.min(Math.max(parseInt(digits.slice(2, 4)), 0), 59);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };
  

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-md shadow">
      <h2 className="text-xl font-bold mb-4">Cakto Provim të Ri</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Rreshti 1: academicYearId, studyYear, afatiId */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* academicYearId */}
            <FormField
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viti Akademik</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh Vitin Akademik" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((ay) => (
                        <SelectItem key={ay.id} value={ay.id}>
                          {ay.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* studyYear */}
            <FormField
              control={form.control}
              name="studyYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viti Studimeve</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh Vitin e Studimeve" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Viti 1</SelectItem>
                      <SelectItem value="2">Viti 2</SelectItem>
                      <SelectItem value="3">Viti 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* afatiId */}
            <FormField
              control={form.control}
              name="afatiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afati</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh Afatin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {afatiList.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rreshti 2: subjectId, instructorId */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lënda</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh Lëndën" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh Profesorin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instructors.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name} ({inst.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rreshti 3: date, hour */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Provimit</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* hour */}
            <FormField
  name="hour"
  control={form.control}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Ora e Provimit</FormLabel>
      <FormControl>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            className="pl-10 w-full border rounded-md px-3 py-2 text-center font-normal tracking-widest"
            value={formatMaskedTime(field.value || "")}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
              form.setValue("hour", digitsOnly);
            }}
            onBlur={() => {
              const formatted = normalizeTime(field.value || "");
              form.setValue("hour", formatted, { shouldValidate: true });
            }}
          />
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


          </div>

          <Button type="submit" className="mt-4">
            Shto Provimin
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ExamsScheduleForm;
