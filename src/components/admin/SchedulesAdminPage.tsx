import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanel from "@/components/FilterPanel";

// The filter interface from your FilterPanel
interface FilterOptions {
  academicYear: string;
  semester: string;
  yearOfStudy: string;
}

// The schedule interface
interface ScheduleItem {
  id: string;
  eventType: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  academicYear: string;
  studyYear: number;
  subjectName: string;
  instructorName: string;
  semesterName: string;
  locationName: string;
  // foreign keys
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
}

// For dropdown data
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
interface SemesterData {
  id: string;
  name: string;
}
interface ClassLocationData {
  id: string;
  roomName: string;
}

// We can define some academic year options:
const ACADEMIC_YEARS = ["2023/24", "2024/25", "2025/26"];

// The 7 days for multi-select
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


const SchedulesAdminPage: React.FC = () => {
  // State for all schedules
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "All Years",
    semester: "All Semesters",
    yearOfStudy: "All Years",
  });

  // For editing a schedule
  const [editId, setEditId] = useState<string | null>(null);

  // React Hook Form
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // Dropdown data states
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [locations, setLocations] = useState<ClassLocationData[]>([]);

  // Fetch schedules
  async function fetchSchedules() {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
      setSchedules(res.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch dropdown data for subjects, instructors, etc.
  async function fetchDropdownData() {
    try {
      const [subRes, insRes, semRes, locRes] = await Promise.all([
        axiosInstance.get<SubjectData[]>("/subjects"),
        axiosInstance.get<InstructorData[]>("/instructors"),
        axiosInstance.get<SemesterData[]>("/semesters"),
        axiosInstance.get<ClassLocationData[]>("/class-locations"),
      ]);
      setSubjects(subRes.data);
      setInstructors(insRes.data);
      setSemesters(semRes.data);
      setLocations(locRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }

  useEffect(() => {
    fetchSchedules();
    fetchDropdownData();
  }, []);

  // 1) Filter schedules client-side
  const filteredSchedules = schedules.filter((sch) => {
    if (
      filters.academicYear !== "All Years" &&
      sch.academicYear !== filters.academicYear
    ) {
      return false;
    }

    if (
      filters.semester !== "All Semesters" &&
      sch.semesterName !== filters.semester
    ) {
      return false;
    }

    if (filters.yearOfStudy !== "All Years") {
      const numericYear = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (sch.studyYear !== numericYear) {
        return false;
      }
    }
    return true;
  });

  // 2) Start editing
  const startEdit = (sch: ScheduleItem) => {
    setEditId(sch.id);

    // fill the form fields
    setValue("eventType", sch.eventType);
    setValue("startTime", sch.startTime);
    setValue("endTime", sch.endTime);
    setValue("academicYear", sch.academicYear);
    setValue("studyYear", String(sch.studyYear));
    setValue("subjectId", sch.subjectId);
    setValue("instructorId", sch.instructorId);
    setValue("semesterId", sch.semesterId);
    setValue("classLocationId", sch.classLocationId);

    // For multiple select: each item in sch.daysOfWeek
    // We'll set it so the form has those as an array of strings
    // React Hook Form automatically handles <select multiple> if we pass an array
    setValue("daysOfWeek", sch.daysOfWeek);
  };

  // 3) Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    reset({});
  };

  // 4) On submit => PUT
  const onSubmit = async (data: any) => {
    if (!editId) return;
    try {
      // daysOfWeek might be a single string if user only selects 1 option, or an array if multiple
      let daysArr = data.daysOfWeek;
      if (!daysArr) daysArr = [];
      if (typeof daysArr === "string") {
        // only one option selected
        daysArr = [daysArr];
      }

      const numericYear = parseInt(data.studyYear, 10) || 1;

      await axiosInstance.put(`/schedules/${editId}`, {
        eventType: data.eventType,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: daysArr,
        academicYear: data.academicYear,
        studyYear: numericYear,
        subjectId: data.subjectId,
        instructorId: data.instructorId,
        semesterId: data.semesterId,
        classLocationId: data.classLocationId,
      });

      fetchSchedules();
      cancelEdit();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // 5) Delete
  const deleteSchedule = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await axiosInstance.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Schedules Admin</h1>

      {/* Filter panel */}
      <div className="mb-6">
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Table of schedules */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">All Schedules</h2>
        {loading ? (
          <p>Loading schedules...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Event Type</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Days</th>
                  <th className="p-2 text-left">AcademicYear</th>
                  <th className="p-2 text-left">StudyYear</th>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Instructor</th>
                  <th className="p-2 text-left">Semester</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((sch) => (
                  <tr key={sch.id} className="border-b">
                    <td className="p-2">{sch.eventType}</td>
                    <td className="p-2">
                      {sch.startTime} - {sch.endTime}
                    </td>
                    <td className="p-2">{sch.daysOfWeek.join(", ")}</td>
                    <td className="p-2">{sch.academicYear}</td>
                    <td className="p-2">{sch.studyYear}</td>
                    <td className="p-2">{sch.subjectName}</td>
                    <td className="p-2">{sch.instructorName}</td>
                    <td className="p-2">{sch.semesterName}</td>
                    <td className="p-2">{sch.locationName}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => startEdit(sch)}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSchedule(sch.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSchedules.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-2 text-center text-gray-500">
                      No schedules found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit form for all fields with dropdown for days */}
      {editId && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Edit Schedule</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* eventType */}
              <div>
                <label className="block font-medium mb-1">Event Type</label>
                <input
                  {...register("eventType")}
                  placeholder="e.g. lab group1"
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* daysOfWeek (single dropdown) */}
<div>
  <label className="block font-medium mb-1">Day of Week</label>
  <select
    {...register("daysOfWeek")}
    className="border p-1 rounded w-full"
  >
    <option value="">-- Select Day --</option>
    {DAY_OPTIONS.map((day) => (
      <option key={day} value={day}>
        {day}
      </option>
    ))}
  </select>
</div>


              {/* startTime */}
              <div>
                <label className="block font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  {...register("startTime")}
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* endTime */}
              <div>
                <label className="block font-medium mb-1">End Time</label>
                <input
                  type="time"
                  {...register("endTime")}
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* academicYear -> dropdown */}
              <div>
                <label className="block font-medium mb-1">Academic Year</label>
                <select
                  {...register("academicYear")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Year --</option>
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* studyYear -> numeric */}
              <div>
                <label className="block font-medium mb-1">Study Year</label>
                <input
                  type="number"
                  {...register("studyYear")}
                  placeholder="2"
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* subjectId -> dropdown */}
              <div>
                <label className="block font-medium mb-1">Subject</label>
                <select {...register("subjectId")} className="border p-1 rounded w-full">
                  <option value="">-- Select Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} 
                    </option>
                  ))}
                </select>
              </div>

              {/* instructorId -> dropdown */}
              <div>
                <label className="block font-medium mb-1">Instructor</label>
                <select
                  {...register("instructorId")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* semesterId -> dropdown */}
              <div>
                <label className="block font-medium mb-1">Semester</label>
                <select
                  {...register("semesterId")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Semester --</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* classLocationId -> dropdown */}
              <div>
                <label className="block font-medium mb-1">Location</label>
                <select
                  {...register("classLocationId")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.roomName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  reset({});
                }}
                className="bg-gray-400 text-white px-4 py-1.5 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SchedulesAdminPage;
