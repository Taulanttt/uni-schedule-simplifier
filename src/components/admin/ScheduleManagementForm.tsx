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

//
// 1) Validation schema
//
const formSchema = z.object({
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  studyYear: z.string().min(1, { message: "Study year is required" }),
  semesterId: z.string().min(1, { message: "Semester is required" }),
  subjectId: z.string().min(1, { message: "Subject is required" }),
  instructorId: z.string().min(1, { message: "Instructor is required" }),
  eventType: z.string().min(1, { message: "Event type is required" }),
  classroom: z.string().min(1, { message: "Classroom is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  daysOfWeek: z.array(z.string()).min(1, {
    message: "At least one day must be selected",
  }),
});
type FormValues = z.infer<typeof formSchema>;

// 2) Data shape for dropdown fetch
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

//
// 3) The component
//
const ScheduleManagementForm: React.FC = () => {
  const { toast } = useToast();

  // State for dropdown data
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);

  // 4) React Hook Form config
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

  // 5) On mount, fetch dropdown data
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
        console.error("Error fetching dropdown data:", error);
      }
    }
    fetchData();
  }, []);

  // 6) Submission => POST /schedules
  const onSubmit = async (data: FormValues) => {
    try {
      const scheduleToPost = {
        ...data,
        studyYear: Number(data.studyYear), // parse if needed
      };

      const res = await axiosInstance.post("/schedules", scheduleToPost);
      console.log("Schedule created:", res.data);

      toast({
        title: "Schedule Created",
        description: "Your schedule event was added successfully!",
      });

      form.reset();
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create schedule. Check console.",
        variant: "destructive",
      });
    }
  };

  //
  // 7) The Layout
  //
  return (
    <div className="bg-white p-8 md:p-10 rounded-lg shadow max-w-5xl mx-auto">
      {/* Heading */}
      <h2 className="text-2xl font-bold mb-6 text-center">Schedule Management</h2>
      <p className="text-gray-600 mb-6 text-center">
        Create or update a schedule event for a class or exam
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ROW 1: (Academic Year, Study Year, Semester) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Year */}
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

            {/* Study Year */}
            <FormField
              control={form.control}
              name="studyYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select study year" />
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

            {/* Semester */}
            <FormField
              control={form.control}
              name="semesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={sem.id}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ROW 2: (Subject, Instructor) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
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

            {/* Instructor */}
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
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ROW 3: (Event Type, Classroom) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Type */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lecture, Lab Group 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Classroom */}
            <FormField
              control={form.control}
              name="classroom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classroom</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Classroom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.roomName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ROW 4: (StartTime/EndTime) + (DaysOfWeek) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start/End Times in one column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DaysOfWeek in the other column */}
            <FormField
              control={form.control}
              name="daysOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days of Week</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {field.value.length > 0
                          ? field.value.join(", ")
                          : "Select days"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 space-y-2">
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" className="px-8 py-3">
              Add Event
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ScheduleManagementForm;
