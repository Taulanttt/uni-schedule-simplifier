import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosInstance";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";

/* 
  1) Shema e validimit (Zod) - mesazhet mbeten në shqip
*/
const formSchema = z.object({
  academicYear: z.string().min(1, { message: "Viti akademik është i detyrueshëm" }),
  studyYear: z.string().min(1, { message: "Viti i studimit është i detyrueshëm" }),
  semesterId: z.string().min(1, { message: "Semestri është i detyrueshëm" }),
  subjectId: z.string().min(1, { message: "Lënda është e detyrueshme" }),
  instructorId: z.string().min(1, { message: "Profesori është i detyrueshëm" }),
  eventType: z.string().min(1, { message: "Lloji i orarit është i detyrueshëm" }),
  classroom: z.string().min(1, { message: "Salla është e detyrueshme" }),
  startTime: z.string().min(1, { message: "Ora e fillimit është e detyrueshme" }),
  endTime: z.string().min(1, { message: "Ora e përfundimit është e detyrueshme" }),
  daysOfWeek: z.array(z.string()).min(1, {
    message: "Duhet të zgjidhni të paktën një ditë",
  }),
});
type FormValues = z.infer<typeof formSchema>;

/* 
  2) Të dhënat për dropdown
*/
interface SubjectData {
  id: string;
  name: string;
}
interface InstructorData {
  id: string;
  name: string;
}
interface SemesterData {
  id: string;
  name: string;
}
interface LocationData {
  id: string;
  roomName: string;
}

/* 
  3) Hartë për kthimin e ditëve nga shqip në anglisht
  p.sh. "E Hënë" -> "Monday"
*/
const dayMapToEnglish: Record<string, string> = {
  "E Hënë": "Monday",
  "E Martë": "Tuesday",
  "E Mërkurë": "Wednesday",
  "E Enjte": "Thursday",
  "E Premte": "Friday",
  "E Shtunë": "Saturday",
  "E Diel": "Sunday",
};

const ScheduleManagementForm: React.FC = () => {
  const { toast } = useToast();

  // Gjendja për dropdown-e
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);

  // 4) React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYear: "",
      studyYear: "",
      semesterId: "",
      subjectId: "",
      instructorId: "",
      eventType: "",
      classroom: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
    },
  });

  // 5) Marrim të dhënat për dropdown nga backend
  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, insRes, semRes, locRes] = await Promise.all([
          axiosInstance.get("/subjects"),
          axiosInstance.get("/instructors"),
          axiosInstance.get("/semesters"),
          axiosInstance.get("/class-locations"),
        ]);
        setSubjects(subRes.data);
        setInstructors(insRes.data);
        setSemesters(semRes.data);
        setLocations(locRes.data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së të dhënave:", error);
      }
    }
    fetchData();
  }, []);

  // 6) Kur dergohet formulari
  const onSubmit = async (data: FormValues) => {
    try {
      // a) Konverto ditët nga shqip në anglisht
      const englishDays = data.daysOfWeek.map(
        (day) => dayMapToEnglish[day] || day
      );

      // b) Ndërto payload, duke ruajtur vlerat e tjera siç janë
      const payload = {
        ...data,
        studyYear: Number(data.studyYear),
        daysOfWeek: englishDays, // vendosim vlerat anglisht për backend
      };

      // c) Post te backend
      await axiosInstance.post("/schedules", payload);

      toast({
        title: "Orari u shtua me sukses",
        description: "Ngjarja u regjistrua me sukses në sistem.",
      });

      form.reset();
    } catch (error) {
      console.error("Gabim në krijimin e orarit:", error);
      toast({
        title: "Gabim",
        description: "Nuk u arrit të shtohet orari. Kontrolloni konsolen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-lg shadow max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Menaxhimi i Orarit</h2>
      <p className="text-gray-600 mb-6 text-center">
        Shto ose përditëso një ngjarje në orar për një klasë apo provim.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Rreshti 1: Viti akademik, Viti studimit, Semestri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              name="academicYear"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viti Akademik</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh vitin" />
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

            <FormField
              name="studyYear"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viti i Studimit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh vitin" />
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

            <FormField
              name="semesterId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semestri</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh semestrin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {semesters.map((s) => (
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
          </div>

          {/* Rreshti 2: Lënda, Profesori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              name="subjectId"
              control={form.control}
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
              name="instructorId"
              control={form.control}
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
                      {instructors.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rreshti 3: Lloji i orës, Salla */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              name="eventType"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lloji i Orës</FormLabel>
                  <FormControl>
                    <Input placeholder="p.sh. Ligjëratë, Grup 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="classroom"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salla</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh sallën" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.roomName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rreshti 4: Orët dhe Ditët */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                name="startTime"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora e Fillimit</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="endTime"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora e Përfundimit</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="daysOfWeek"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ditët</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {field.value.length > 0
                          ? field.value.join(", ")
                          : "Zgjidh ditët"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 space-y-2">
                      {[
                        "E Hënë",
                        "E Martë",
                        "E Mërkurë",
                        "E Enjte",
                        "E Premte",
                        "E Shtunë",
                        "E Diel",
                      ].map((day) => {
                        const isChecked = field.value.includes(day);
                        return (
                          <FormItem
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, day]);
                                  } else {
                                    field.onChange(
                                      field.value.filter((d) => d !== day)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <Label className="text-sm">{day}</Label>
                          </FormItem>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Butoni submit */}
          <div className="flex justify-end">
            <Button type="submit" className="px-8 py-3">
              Shto Ngjarjen
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ScheduleManagementForm;
