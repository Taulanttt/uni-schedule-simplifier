import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";

// -------------------
// 1) Zod schema
// -------------------
const formSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  studyYear: z.string().min(1, "Study year is required"),
  afati: z.string().min(1, "Exam period is required"),     // we store the 'afatiId' or 'afatiName'
  subjectId: z.string().min(1, "Subject ID is required"),
  instructorId: z.string().min(1, "Instructor ID is required"),
  date: z.date({ required_error: "Please select a date." }),
  hour: z.string().min(1, "Please select a time."),
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
  // States for dropdown options
  const [afatiList, setAfatiList] = useState<AfatiData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);

  // 2) React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYear: "",
      studyYear: "",
      afati: "",
      subjectId: "",
      instructorId: "",
      date: undefined,
      hour: "",
    },
  });

  // 3) On mount, fetch data for dropdowns
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        // GET /afati -> array of { id, name }
        const afatiRes = await axiosInstance.get<AfatiData[]>("/afati");
        setAfatiList(afatiRes.data);

        // GET /subjects -> array of { id, name, code }
        const subRes = await axiosInstance.get<SubjectData[]>("/subjects");
        setSubjects(subRes.data);

        // GET /instructors -> array of { id, name, role }
        const insRes = await axiosInstance.get<InstructorData[]>("/instructors");
        setInstructors(insRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    }
    fetchDropdownData();
  }, []);

  // -------------------
  // 4) Actual SUBMIT
  // -------------------
  async function onSubmit(values: FormValues) {
    try {
      // 4a) Find the Afati ID based on the user's selection
      //     Right now, the user is storing "afati = afatiName".
      //     If your backend needs the "afatiId", we find it here:
      const selectedAfati = afatiList.find((af) => af.name === values.afati);

      // 4b) Build the request body
      const requestBody = {
        eventType: "exam",
        academicYear: values.academicYear,
        studyYear: Number(values.studyYear),
        // convert the date into "YYYY-MM-DD" string if needed
        date: format(values.date, "yyyy-MM-dd"),
        hour: values.hour,

        // If your backend expects "afatiId", we pass the ID:
        afatiId: selectedAfati ? selectedAfati.id : "",

        // The user already selected these as IDs:
        subjectId: values.subjectId,
        instructorId: values.instructorId,
      };

      // 4c) POST /exams with the request body
      await axiosInstance.post("/exams", requestBody);

      // 4d) Show success toast
      toast({
        title: "Exam scheduled successfully",
      });

      // 4e) Reset the form
      form.reset();
    } catch (error) {
      console.error("Error scheduling exam:", error);
      toast({
        title: "Error scheduling exam",
        description: "Please check console or try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Schedule New Exam</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: academicYear, studyYear, afati */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* academicYear */}
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
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
                    <FormLabel>Study Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Year of study" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
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
                    <FormLabel>Afati (Exam Period)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam period" />
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

            {/* Row 2: subjectId, instructorId */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* subjectId */}
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
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
                    <FormLabel>Instructor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Instructor" />
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

            {/* Row 3: date, hour */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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
                    <FormLabel>Hour</FormLabel>
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

            {/* Submit */}
            <Button type="submit" className="w-full md:w-auto">
              Schedule Exam
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ExamsScheduleForm;
