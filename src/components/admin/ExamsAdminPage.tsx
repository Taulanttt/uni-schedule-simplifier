import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanelExams from "@/components/FilterPanelExams";

// The exam shape, with afatiId + optional Afati object
interface ExamItem {
  id: string;
  eventType: string;         // "exam"
  academicYear: string;      // e.g. "2024/25"
  studyYear: number;         // e.g. 2
  date: string;              // e.g. "2025-02-15"
  hour: string;              // e.g. "10:00:00"

  // Here we store the foreign key ID
  afatiId: string;           // e.g. "afb6-..."
  subjectId: string;
  instructorId: string;

  // Associations from backend:
  Subject?: {
    id: string;
    name: string;
  };
  Instructor?: {
    id: string;
    name: string;
  };
  Afati?: {
    id: string;
    name: string;  // e.g. "February"
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

// For afati dropdown
interface AfatiData {
  id: string;
  name: string;
}

// The filter interface for exam
import { FilterOptionsexam } from "@/types";

const ExamsAdminPage: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // For subject/instructor/afati dropdowns
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [afatis, setAfatis] = useState<AfatiData[]>([]);

  // Hook Form for editing an exam
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // Our exam filters state
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "All Years",
    afati: "All Afati",
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

  // 2) Fetch subjects & instructors & afati
  async function fetchDropdownData() {
    try {
      const [subRes, instRes, afatiRes] = await Promise.all([
        axiosInstance.get<SubjectData[]>("/subjects"),
        axiosInstance.get<InstructorData[]>("/instructors"),
        axiosInstance.get<AfatiData[]>("/afati"),
      ]);
      setSubjects(subRes.data);
      setInstructors(instRes.data);
      setAfatis(afatiRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }

  useEffect(() => {
    fetchExams();
    fetchDropdownData();
  }, []);

  // 3) Filter logic for exams
  const filteredExams = exams.filter((exam) => {
    // By academicYear
    if (
      filters.academicYear !== "All Years" &&
      exam.academicYear !== filters.academicYear
    ) {
      return false;
    }

    // By afati name
    // The exam has exam.Afati?.name, and user picked filters.afati
    if (filters.afati !== "All Afati") {
      // Only show if exam.Afati?.name === filters.afati
      if (exam.Afati?.name !== filters.afati) {
        return false;
      }
    }

    // By yearOfStudy
    if (filters.yearOfStudy !== "All Years") {
      const numeric = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (exam.studyYear !== numeric) {
        return false;
      }
    }

    return true;
  });

  // Start editing
  const startEdit = (exam: ExamItem) => {
    setEditId(exam.id);

    // We'll set the form values to the actual data
    setValue("afatiId", exam.afatiId);
    setValue("academicYear", exam.academicYear);
    setValue("studyYear", String(exam.studyYear));
    setValue("date", exam.date);
    setValue("hour", exam.hour);
    setValue("subjectId", exam.subjectId);
    setValue("instructorId", exam.instructorId);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    reset({});
  };

  // 4) Submit => PUT /exams/:id
  const onSubmit = async (data: any) => {
    if (!editId) return;
    try {
      const numericYear = parseInt(data.studyYear, 10) || 1;

      await axiosInstance.put(`/exams/${editId}`, {
        eventType: "exam",
        // We store the foreign key as "afatiId"
        afatiId: data.afatiId,
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

  // 5) Delete => /exams/:id
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
        <FilterPanelExams filters={filters} setFilters={setFilters} />
      </div>

      {/* Table of Exams */}
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
                    {/* We display exam.Afati?.name */}
                    <td className="p-2">{exam.Afati?.name}</td>
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
              {/* afatiId => pick from the list of afatis */}
              <div>
                <label className="block font-medium mb-1">Afati (Exam Period)</label>
                <select
                  {...register("afatiId")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Afati --</option>
                  {afatis.map((af) => (
                    <option key={af.id} value={af.id}>
                      {af.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* academicYear */}
              <div>
                <label className="block font-medium mb-1">Academic Year</label>
                <select
                  {...register("academicYear")}
                  className="border p-1 rounded w-full"
                >
                  <option value="">-- Select Year --</option>
                  <option value="2023/24">2023/24</option>
                  <option value="2024/25">2024/25</option>
                  <option value="2025/26">2025/26</option>
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

              {/* date */}
              <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                  type="date"
                  {...register("date")}
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* hour */}
              <div>
                <label className="block font-medium mb-1">Hour</label>
                <input
                  type="time"
                  {...register("hour")}
                  className="border p-1 rounded w-full"
                />
              </div>

              {/* subjectId */}
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

              {/* instructorId */}
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
