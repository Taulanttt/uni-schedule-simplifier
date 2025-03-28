"use client"

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  GraduationCapIcon,
} from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  subjectId: z.string().min(1),
  instructorId: z.string().min(1),
  semesterId: z.string().min(1),
  classroom: z.string().min(1),
  eventType: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  daysOfWeek: z.array(z.string()).min(1),
  academicYear: z.string().min(1),
  studyYear: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const steps = [
  { id: "course", title: "Course Details", icon: BookOpenIcon },
  { id: "schedule", title: "Schedule", icon: ClockIcon },
  { id: "review", title: "Review", icon: CheckIcon },
];

export default function ScheduleManagementForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [locations, setLocations] = useState([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: "",
      instructorId: "",
      semesterId: "",
      classroom: "",
      eventType: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
      academicYear: "",
      studyYear: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      const [subs, insts, sems, locs] = await Promise.all([
        axiosInstance.get("/subjects"),
        axiosInstance.get("/instructors"),
        axiosInstance.get("/semesters"),
        axiosInstance.get("/class-locations"),
      ]);
      setSubjects(subs.data);
      setInstructors(insts.data);
      setSemesters(sems.data);
      setLocations(locs.data);
    }
    fetchData();
  }, []);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data: FormValues) => {
    if (currentStep < steps.length - 1) return nextStep();
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/schedules", {
        ...data,
        studyYear: parseInt(data.studyYear),
      });
      toast({
        title: "Success",
        description: "Schedule created successfully!",
      });
      form.reset();
      setCurrentStep(0);
    } catch (err) {
      toast({ title: "Error", description: "Failed to create schedule.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabel = (id: string, arr: any[], key = "id", label = "name") => arr.find((item) => item[key] === id)?.[label] || "";

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={cn("w-10 h-10 flex items-center justify-center rounded-full border-2", i <= currentStep ? "border-primary text-primary" : "border-muted text-muted-foreground")}>{i < currentStep ? <CheckIcon className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}</div>
              <span className="text-xs mt-1">{step.title}</span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Subject */}
                <FormField control={form.control} name="subjectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel><BookOpenIcon className="inline h-4 w-4 mr-1" /> Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                      <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Instructor */}
                <FormField control={form.control} name="instructorId" render={({ field }) => (
                  <FormItem>
                    <FormLabel><UserIcon className="inline h-4 w-4 mr-1" /> Instructor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Instructor" /></SelectTrigger></FormControl>
                      <SelectContent>{instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Semester */}
                <FormField control={form.control} name="semesterId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger></FormControl>
                      <SelectContent>{semesters.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Classroom */}
                <FormField control={form.control} name="classroom" render={({ field }) => (
                  <FormItem>
                    <FormLabel><MapPinIcon className="inline h-4 w-4 mr-1" /> Classroom</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Classroom" /></SelectTrigger></FormControl>
                      <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.roomName}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Event Type */}
                <FormField control={form.control} name="eventType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <FormControl><Input placeholder="e.g. Lecture, Lab" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Academic Year */}
                <FormField control={form.control} name="academicYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="2023/24">2023/24</SelectItem>
                        <SelectItem value="2024/25">2024/25</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Study Year */}
                <FormField control={form.control} name="studyYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel><GraduationCapIcon className="inline h-4 w-4 mr-1" /> Study Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="daysOfWeek" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Days of Week</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {weekdays.map((day) => (
                        <Button
                          type="button"
                          variant={field.value.includes(day) ? "default" : "outline"}
                          key={day}
                          onClick={() => {
                            field.onChange(
                              field.value.includes(day)
                                ? field.value.filter((d) => d !== day)
                                : [...field.value, day]
                            );
                          }}
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Schedule</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Subject:</strong> {getLabel(form.getValues("subjectId"), subjects)}</div>
                  <div><strong>Instructor:</strong> {getLabel(form.getValues("instructorId"), instructors)}</div>
                  <div><strong>Type:</strong> {form.getValues("eventType")}</div>
                  <div><strong>Classroom:</strong> {getLabel(form.getValues("classroom"), locations, "id", "roomName")}</div>
                  <div><strong>Semester:</strong> {getLabel(form.getValues("semesterId"), semesters)}</div>
                  <div><strong>Academic Year:</strong> {form.getValues("academicYear")}</div>
                  <div><strong>Study Year:</strong> Year {form.getValues("studyYear")}</div>
                  <div><strong>Time:</strong> {form.getValues("startTime")} - {form.getValues("endTime")}</div>
                  <div className="col-span-2"><strong>Days:</strong> {form.getValues("daysOfWeek").join(", ")}</div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : currentStep === steps.length - 1 ? "Create Schedule" : (<>Next <ArrowRightIcon className="ml-2 h-4 w-4" /></>)}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}