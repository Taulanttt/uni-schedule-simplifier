import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { toast, useToast } from "@/hooks/use-toast";

// 1) Shema e validimit (Zod) me z.coerce.date()
const formSchema = z.object({
  academicYear: z.string().min(1, "Viti akademik është i detyrueshëm"),
  studyYear: z.string().min(1, "Viti i studimeve është i detyrueshëm"),
  afati: z.string().min(1, "Afati (periudha e provimit) është i detyrueshëm"),
  subjectId: z.string().min(1, "Lënda është e detyrueshme"),
  instructorId: z.string().min(1, "Profesori është i detyrueshëm"),

  // përdorim coerce.date për të konvertuar "YYYY-MM-DD" nga <input type="date" />
  date: z.coerce.date({ required_error: "Ju lutem zgjidhni një datë." }),

  hour: z.string().min(1, "Ju lutem zgjidhni një orë."),
});
type FormValues = z.infer<typeof formSchema>;

interface AfatiData {
  id: string;
  name: string;
}
interface SubjectData {
  id: string;
  name: string;
  code: string;
}
interface InstructorData {
  id: string;
  name: string;
  role: string;
}

const ExamsScheduleForm: React.FC = () => {
  const { toast } = useToast();

  // Listat e afateve, lëndëve dhe profesorëve
  const [afatiList, setAfatiList] = useState<AfatiData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);

  // 2) Hook Form (React Hook Form)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYear: "",
      studyYear: "",
      afati: "",
      subjectId: "",
      instructorId: "",
      date: undefined, // z.coerce.date do ta kthejë në objekt Date
      hour: "",
    },
  });

  // 3) Marrim të dhëna për dropdown-et nga backend
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const afatiRes = await axiosInstance.get<AfatiData[]>("/afati");
        setAfatiList(afatiRes.data);

        const subRes = await axiosInstance.get<SubjectData[]>("/subjects");
        setSubjects(subRes.data);

        const insRes = await axiosInstance.get<InstructorData[]>("/instructors");
        setInstructors(insRes.data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së të dhënave:", error);
      }
    }
    fetchDropdownData();
  }, []);

  // 4) Kur submit-im formularin → POST /exams
  async function onSubmit(values: FormValues) {
    try {
      // Gjejmë afatin sipas emrit (opsionale, nëse backend pret "afatiId")
      const selectedAfati = afatiList.find((af) => af.name === values.afati);

      // Ndërto trupin e kërkesës
      const requestBody = {
        eventType: "exam",
        academicYear: values.academicYear,
        studyYear: Number(values.studyYear),
        // e kthejmë Date obj. në string "yyyy-MM-dd"
        date: format(values.date, "yyyy-MM-dd"),
        hour: values.hour,
        // nëse do "afatiId", mund ta caktoni
        afatiId: selectedAfati ? selectedAfati.id : "",
        subjectId: values.subjectId,
        instructorId: values.instructorId,
      };

      await axiosInstance.post("/exams", requestBody);

      // Mesazh suksesi
      toast({
        title: "Provimi u shtua me sukses!"
      });

      // Pastrojmë formularin
      form.reset();
    } catch (error) {
      console.error("Gabim gjatë shtimit të provimit:", error);
      toast({
        title: "Gabim gjatë shtimit të provimit",
        description: "Ju lutem kontrolloni konsolën ose provoni përsëri.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Cakto Provim të Ri</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rreshti 1: (Viti Akademik, Viti Studimeve, Afati) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* academicYear */}
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viti Akademik</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidh vitin akademik" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2023/24">2023/24</SelectItem>
                        <SelectItem value="2024/25">2024/25</SelectItem>
                        <SelectItem value="2025/26">2025/26</SelectItem>
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
                    <FormLabel>Viti i Studimeve</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidh vitin e studimeve" />
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

              {/* afati */}
              <FormField
                control={form.control}
                name="afati"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Afati (Periudha e Provimit)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidh afatin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {afatiList.map((af) => (
                          <SelectItem key={af.id} value={af.name}>
                            {af.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rreshti 2: (Lënda, Profesori) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* subjectId */}
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lënda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidh lëndën" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* instructorId */}
              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profesori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidh profesorin" />
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

            {/* Rreshti 3: (Data, Ora) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* date (tani input type="date") */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Provimit</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        // React Hook Form 'field.onChange' pret vlerë string,
                        // por ne kemi z.coerce.date. Kjo funksionon mirë.
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
                control={form.control}
                name="hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora e Provimit</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="time" {...field} className="pl-10" />
                      </FormControl>
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Butoni Submit */}
            <Button type="submit" className="w-full md:w-auto">
              Cakto Provimin
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ExamsScheduleForm;
