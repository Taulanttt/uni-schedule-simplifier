import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanel from "@/components/FilterPanel";

// The exam shape
interface ExamItem {
  id: string;
  eventType: string;    // usually "exam"
  academicYear: string; // e.g. "2024/25"
  studyYear: number;    // e.g. 2
  date: string;         // e.g. "2025-02-15"
  hour: string;         // e.g. "10:00:00"
  afati: string;        // e.g. "February"
  subjectId: string;    // foreign key
  instructorId: string; // foreign key

  // For display
  Subject?: {
    id: string;
    name: string;
  };
  Instructor?: {
    id: string;
    name: string;
  };
}

// For subject & instructor dropdown
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

// The filter object from your FilterPanel
interface FilterOptions {
  academicYear: string; // e.g. "2024/25" or "All Years"
  semester: string;     // e.g. "All Semesters" (we do not actually filter by it, as exam has no semester)
  yearOfStudy: string;  // e.g. "Year 1" or "All Years"
}

// Local array for academic years if needed:
const ACADEMIC_YEARS = ["2023/24", "2024/25", "2025/26"];

const ExamsAdminPage: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(false);

  // For editing
  const [editId, setEditId] = useState<string | null>(null);

  // React Hook Form
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // For subject/instructor dropdown
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);

  // === FILTER ===
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "All Years",
    semester: "All Semesters",
    yearOfStudy: "All Years",
  });

  // 1) Fetch exams
  async function fetchExams() {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ExamItem[]>("/exams");
      setExams(res.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2) Fetch subjects & instructors
  async function fetchDropdownData() {
    try {
      const [subRes, instRes] = await Promise.all([
        axiosInstance.get<SubjectData[]>("/subjects"),
        axiosInstance.get<InstructorData[]>("/instructors"),
      ]);
      setSubjects(subRes.data);
      setInstructors(instRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }

  useEffect(() => {
    fetchExams();
    fetchDropdownData();
  }, []);

  // === FILTER logic (client-side) ===
  const filteredExams = exams.filter((exam) => {
    // 1) academicYear
    if (
      filters.academicYear !== "All Years" &&
      exam.academicYear !== filters.academicYear
    ) {
      return false;
    }

    // 2) semester => skipping because exam doesn't have a .semester field
    // if (
    //   filters.semester !== "All Semesters" &&
    //   exam.semester !== ...
    // ) { ... }

    // 3) yearOfStudy => parse out number
    if (filters.yearOfStudy !== "All Years") {
      const numericYear = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (exam.studyYear !== numericYear) {
        return false;
      }
    }

    return true;
  });

  // 3) Start editing
  const startEdit = (exam: ExamItem) => {
    setEditId(exam.id);

    setValue("afati", exam.afati);
    setValue("academicYear", exam.academicYear);
    setValue("studyYear", String(exam.studyYear));
    setValue("date", exam.date);
    setValue("hour", exam.hour);
    setValue("subjectId", exam.subjectId);
    setValue("instructorId", exam.instructorId);
  };

  // 4) Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    reset({});
  };

  // 5) Submit => PUT /exams/:id
  const onSubmit = async (data: any) => {
    if (!editId) return;
    try {
      const numericYear = parseInt(data.studyYear, 10) || 1;

      await axiosInstance.put(`/exams/${editId}`, {
        eventType: "exam", // usually "exam"
        afati: data.afati,
        academicYear: data.academicYear,
        studyYear: numericYear,
        date: data.date,
        hour: data.hour,
        subjectId: data.subjectId,
        instructorId: data.instructorId,
      });

      fetchExams();
      cancelEdit();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // 6) Delete => DELETE /exams/:id
  const deleteExam = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await axiosInstance.delete(`/exams/${id}`);
      fetchExams();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exams Admin</h1>

      {/* Filter Panel */}
      <div className="mb-6">
        {/* Reuse your existing FilterPanel */}
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Exams Table */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">All Exams</h2>
        {loading ? (
          <p>Loading exams...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Afati</th>
                  <th className="p-2 text-left">Date / Hour</th>
                  <th className="p-2 text-left">AcademicYear</th>
                  <th className="p-2 text-left">StudyYear</th>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Instructor</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b">
                    <td className="p-2">{exam.afati}</td>
                    <td className="p-2">
                      {exam.date} / {exam.hour}
                    </td>
                    <td className="p-2">{exam.academicYear}</td>
                    <td className="p-2">{exam.studyYear}</td>
                    <td className="p-2">{exam.Subject?.name}</td>
                    <td className="p-2">{exam.Instructor?.name}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => startEdit(exam)}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExams.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-2 text-center text-gray-500">
                      No exams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editId && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Edit Exam</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* afati */}
              <div>
                <label className="block font-medium mb-1">Afati (Exam Period)</label>
                <input
                  {...register("afati")}
                  placeholder="e.g. February"
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* academicYear dropdown */}
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

              {/* studyYear */}
              <div>
                <label className="block font-medium mb-1">Study Year</label>
                <input
                  type="number"
                  {...register("studyYear")}
                  placeholder="2"
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* date -> date input */}
              <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                  type="date"
                  {...register("date")}
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* hour -> time input */}
              <div>
                <label className="block font-medium mb-1">Hour</label>
                <input
                  type="time"
                  {...register("hour")}
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* subject dropdown */}
              <div>
                <label className="block font-medium mb-1">Subject</label>
                <select
                  {...register("subjectId")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* instructor dropdown */}
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

export default ExamsAdminPage;
