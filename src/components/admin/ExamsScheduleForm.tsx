import React from "react";
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

// 1) Define the Zod schema
const formSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  studyYear: z.string().min(1, "Study year is required"),
  afati: z.string().min(1, "Exam period is required"), // e.g. "February"
  subjectId: z.string().min(1, "Subject ID is required"),
  instructorId: z.string().min(1, "Instructor ID is required"),
  date: z.date({ required_error: "Please select a date." }),
  hour: z.string().min(1, "Please select a time."),
});

type FormValues = z.infer<typeof formSchema>;

const ExamsScheduleForm: React.FC = () => {
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

  // 3) On submit, log the values + show toast
  function onSubmit(values: FormValues) {
    console.log("Exam data:", values);

    // Show a success toast with the JSON
    toast({
      title: "Exam scheduled successfully",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white text-xs">
            {JSON.stringify(values, null, 2)}
          </code>
        </pre>
      ),
    });

    // Reset form
    form.reset();
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
                          <SelectValue placeholder="Select year of study" />
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
                    <FormLabel>Afati</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. February" {...field} />
                    </FormControl>
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
                    <FormLabel>Subject ID</FormLabel>
                    <FormControl>
                      <Input placeholder="8d71c4da-fc15" {...field} />
                    </FormControl>
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
                    <FormLabel>Instructor ID</FormLabel>
                    <FormControl>
                      <Input placeholder="ffd55ca7-60e1" {...field} />
                    </FormControl>
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
