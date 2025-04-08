import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanelExams from "@/components/FilterPanelExams";

// Përfaqësimi i një provimi me fushat përkatëse
interface ExamItem {
  id: string;
  eventType: string;     // "exam"
  academicYear: string;  // p.sh. "2024/25"
  studyYear: number;     // p.sh. 2
  date: string;          // p.sh. "2025-02-15"
  hour: string;          // p.sh. "10:00:00"

  // Foreign keys
  afatiId: string;
  subjectId: string;
  instructorId: string;

  // Objektet e lidhura
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
    name: string;  // p.sh. "Shkurt"
  };
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
interface AfatiData {
  id: string;
  name: string;
}

// Struktura e filtrit
import { FilterOptionsexam } from "@/types";

const ExamsAdminPage: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Ruajmë ID-në e provimit që editohet aktualisht, si dhe gjendjen e modalit
  const [editId, setEditId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Të dhënat e dropdown-eve
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [afatis, setAfatis] = useState<AfatiData[]>([]);

  // React Hook Form për modifikim
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // Gjendja e filtrit
  const [filters, setFilters] = useState<FilterOptionsexam>({
    academicYear: "All Years",
    afati: "All Afati",
    yearOfStudy: "All Years",
  });

  // 1) Marrim listën e provimeve
  async function fetchExams() {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ExamItem[]>("/exams");
      setExams(res.data);
    } catch (error) {
      console.error("Gabim gjatë marrjes së provimeve:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2) Marrim lëndët, profesorët, afatet
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
      console.error("Gabim gjatë marrjes së dropdown të dhënave:", error);
    }
  }

  useEffect(() => {
    fetchExams();
    fetchDropdownData();
  }, []);

  // 3) Logjika e filtrit
  const filteredExams = exams.filter((exam) => {
    // Filtri sipas vitit akademik
    if (
      filters.academicYear !== "All Years" &&
      exam.academicYear !== filters.academicYear
    ) {
      return false;
    }

    // Filtri sipas afatit
    if (filters.afati !== "All Afati") {
      if (exam.Afati?.name !== filters.afati) {
        return false;
      }
    }

    // Filtri sipas vitit të studimeve
    if (filters.yearOfStudy !== "All Years") {
      const numeric = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (exam.studyYear !== numeric) {
        return false;
      }
    }
    return true;
  });

  // 4) Hap modalin për editim
  const startEdit = (exam: ExamItem) => {
    setEditId(exam.id);

    // Vlerat e formularit i plotësojmë me të dhënat e ekzistueshme
    setValue("afatiId", exam.afatiId);
    setValue("academicYear", exam.academicYear);
    setValue("studyYear", String(exam.studyYear));
    setValue("date", exam.date);
    setValue("hour", exam.hour);
    setValue("subjectId", exam.subjectId);
    setValue("instructorId", exam.instructorId);

    setShowEditModal(true);
  };

  // Mbyll modalin
  const closeModal = () => {
    setEditId(null);
    reset({});
    setShowEditModal(false);
  };

  // 5) Submit => PUT /exams/:id
  const onSubmit = async (data: any) => {
    if (!editId) return;
    try {
      const numericYear = parseInt(data.studyYear, 10) || 1;

      await axiosInstance.put(`/exams/${editId}`, {
        eventType: "exam",
        afatiId: data.afatiId,
        academicYear: data.academicYear,
        studyYear: numericYear,
        date: data.date,
        hour: data.hour,
        subjectId: data.subjectId,
        instructorId: data.instructorId,
      });

      fetchExams();
      closeModal();
    } catch (error) {
      console.error("Gabim gjatë përditësimit:", error);
    }
  };

  // 6) Fshij provimin
  const deleteExam = async (id: string) => {
    if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë provim?")) return;
    try {
      await axiosInstance.delete(`/exams/${id}`);
      fetchExams();
    } catch (error) {
      console.error("Gabim gjatë fshirjes:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin i Provimeve</h1>

      {/* Paneli i filtrit */}
      <div className="mb-6">
        <FilterPanelExams filters={filters} setFilters={setFilters} />
      </div>

      {/* Tabela e provimeve */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Lista e Provimeve</h2>
        {loading ? (
          <p>Po ngarkohet lista e provimeve...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Afati</th>
                  <th className="p-2 text-left">Data / Ora</th>
                  <th className="p-2 text-left">Viti Akademik</th>
                  <th className="p-2 text-left">Viti Studimeve</th>
                  <th className="p-2 text-left">Lënda</th>
                  <th className="p-2 text-left">Profesori</th>
                  <th className="p-2 text-left">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b">
                    <td className="p-2">{exam.Afati?.name}</td>
                    <td className="p-2">
                      {exam.date} / {exam.hour}
                    </td>
                    <td className="p-2">{exam.academicYear}</td>
                    <td className="p-2">{exam.studyYear}</td>
                    <td className="p-2">{exam.Subject?.name}</td>
                    <td className="p-2">{exam.Instructor?.name}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(exam)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Edito
                        </button>
                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Fshij
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExams.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-2 text-center text-gray-500">
                      Asnjë provim nuk u gjet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal-i për Editim */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* Përmbajtja e modalit */}
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-3">Përditëso Provimin</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Afati */}
                <div>
                  <label className="block font-medium mb-1">Afati</label>
                  <select
                    {...register("afatiId")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Afatin --</option>
                    {afatis.map((af) => (
                      <option key={af.id} value={af.id}>
                        {af.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Viti Akademik */}
                <div>
                  <label className="block font-medium mb-1">Viti Akademik</label>
                  <select
                    {...register("academicYear")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Vitin --</option>
                    <option value="2023/24">2023/24</option>
                    <option value="2024/25">2024/25</option>
                    <option value="2025/26">2025/26</option>
                  </select>
                </div>

                {/* Viti i studimeve */}
                <div>
                  <label className="block font-medium mb-1">Viti Studimeve</label>
                  <input
                    type="number"
                    {...register("studyYear")}
                    placeholder="p.sh. 2"
                    className="border p-1 rounded w-full"
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block font-medium mb-1">Data e Provimit</label>
                  <input
                    type="date"
                    {...register("date")}
                    className="border p-1 rounded w-full"
                  />
                </div>

                {/* Ora */}
                <div>
                  <label className="block font-medium mb-1">Ora e Provimit</label>
                  <input
                    type="time"
                    {...register("hour")}
                    className="border p-1 rounded w-full"
                  />
                </div>

                {/* Lënda */}
                <div>
                  <label className="block font-medium mb-1">Lënda</label>
                  <select
                    {...register("subjectId")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Lëndën --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profesori */}
                <div>
                  <label className="block font-medium mb-1">Profesori</label>
                  <select
                    {...register("instructorId")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Profesorin --</option>
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
                  Ruaj
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-400 text-white px-4 py-1.5 rounded hover:bg-gray-500"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsAdminPage;
