import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanel from "@/components/FilterPanel";

interface FilterOptions {
  academicYear: string;  // Will store either "All Years" or an AcademicYearItem.id
  semester: string;      // Will store either "All Semesters" or a semester name
  yearOfStudy: string;   // Will store either "All Years" or a numeric string
}

// Struktura e orarit (tani me academicYearId)
interface ScheduleItem {
  id: string;
  eventType: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  // Now we store only the ID from the server; AcademicYear is optional or null
  academicYearId: string | null;
  studyYear: number;
  subjectName: string;
  instructorName: string;
  semesterName: string;
  locationName: string;
  // Fusha Foreign Key
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
}

// Të dhëna për dropdown
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

// Viti Akademik nga backend
interface AcademicYearItem {
  id: string;
  name: string;    // p.sh. "2025/26"
  isActive: boolean;
}

// Ditët e javës (për <select> në modal)
const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SchedulesAdminPage: React.FC = () => {
  // Lista e orareve
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtrat
  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "All Years",
    semester: "All Semesters",
    yearOfStudy: "All Years",
  });

  // Modal state
  const [editId, setEditId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Hook form
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // Të dhëna për dropdown
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [locations, setLocations] = useState<ClassLocationData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);

  // 1) Marrim oraret
  async function fetchSchedules() {
    setLoading(true);
    try {
      // Server should return academicYearId (and possibly academicYear = null)
      const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
      setSchedules(res.data);
    } catch (error) {
      console.error("Gabim gjatë marrjes së orareve:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2) Marrim subject, instructor, semester, location
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
      console.error("Gabim gjatë marrjes së dropdown-ve:", error);
    }
  }

  // 3) Marrim vitet akademike aktive
  async function fetchAcademicYears() {
    try {
      const res = await axiosInstance.get<AcademicYearItem[]>("/academic-year");
      // filtrojmë vetëm isActive == true
      const activeAY = res.data.filter((ay) => ay.isActive);
      setAcademicYears(activeAY);
    } catch (error) {
      console.error("Gabim gjatë marrjes së viteve akademike:", error);
    }
  }

  useEffect(() => {
    fetchSchedules();
    fetchDropdownData();
    fetchAcademicYears();
  }, []);

  // 4) Filtrim client-side
  const filteredSchedules = schedules.filter((sch) => {
    // Filtri: academicYear => compare sch.academicYearId with filters.academicYear
    if (
      filters.academicYear !== "All Years" &&
      sch.academicYearId !== filters.academicYear
    ) {
      return false;
    }

    // Filtri: semestri (compare sch.semesterName with filters.semester)
    if (
      filters.semester !== "All Semesters" &&
      sch.semesterName !== filters.semester
    ) {
      return false;
    }

    // Filtri: viti i studimeve
    if (filters.yearOfStudy !== "All Years") {
      const numericYear = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (sch.studyYear !== numericYear) {
        return false;
      }
    }

    return true;
  });

  // 5) Fillojmë editimin => hapim modalin
  const startEdit = (sch: ScheduleItem) => {
    setEditId(sch.id);

    // Mbushim formularin me vlerat ekzistuese
    setValue("eventType", sch.eventType);
    setValue("startTime", sch.startTime);
    setValue("endTime", sch.endTime);
    setValue("academicYearId", sch.academicYearId || ""); // set the ID
    setValue("studyYear", String(sch.studyYear));
    setValue("subjectId", sch.subjectId);
    setValue("instructorId", sch.instructorId);
    setValue("semesterId", sch.semesterId);
    setValue("classLocationId", sch.classLocationId);
    // daysOfWeek might be multiple
    setValue("daysOfWeek", sch.daysOfWeek);

    setShowEditModal(true);
  };

  // Mbyllja e modalit
  const closeModal = () => {
    setEditId(null);
    reset({});
    setShowEditModal(false);
  };

  // 6) Ruaj me PUT
  const onSubmit = async (data: any) => {
    if (!editId) return;
    try {
      let daysArr = data.daysOfWeek;
      if (!daysArr) daysArr = [];
      // Në rast se user-i ka zgjedhur një vlerë të vetme
      if (typeof daysArr === "string") {
        daysArr = [daysArr];
      }

      const numericYear = parseInt(data.studyYear, 10) || 1;

      await axiosInstance.put(`/schedules/${editId}`, {
        eventType: data.eventType,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: daysArr,
        academicYearId: data.academicYearId, // ID e vitit akademik
        studyYear: numericYear,
        subjectId: data.subjectId,
        instructorId: data.instructorId,
        semesterId: data.semesterId,
        classLocationId: data.classLocationId,
      });

      fetchSchedules();
      closeModal();
    } catch (error) {
      console.error("Gabim gjatë përditësimit:", error);
    }
  };

  // 7) Fshirja
  const deleteSchedule = async (id: string) => {
    if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë orar?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (error) {
      console.error("Gabim gjatë fshirjes:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin i Orareve</h1>

      {/* Filter Panel */}
      <div className="mb-6">
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Tabela e orareve */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Të Gjitha Oraret</h2>
        {loading ? (
          <p>Po ngarkohet lista e orareve...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 text-left">Lloji i Ngjarjes</th>
                  <th className="p-2 text-left">Ora</th>
                  <th className="p-2 text-left">Ditët</th>
                  <th className="p-2 text-left">Viti Akademik</th>
                  <th className="p-2 text-left">Viti Studimeve</th>
                  <th className="p-2 text-left">Lënda</th>
                  <th className="p-2 text-left">Profesori</th>
                  <th className="p-2 text-left">Semestri</th>
                  <th className="p-2 text-left">Salla</th>
                  <th className="p-2 text-left">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((sch) => {
                  // Lookup the academic year by its ID in our academicYears array
                  const yearObj = academicYears.find(
                    (ay) => ay.id === sch.academicYearId
                  );

                  return (
                    <tr key={sch.id} className="border-b">
                      <td className="p-2">{sch.eventType}</td>
                      <td className="p-2">
                        {sch.startTime} - {sch.endTime}
                      </td>
                      <td className="p-2">
                        {sch.daysOfWeek.join(", ")}
                      </td>
                      {/* Show the academic year name by looking it up; default to "—" if not found */}
                      <td className="p-2">
                        {yearObj?.name || "—"}
                      </td>
                      <td className="p-2">{sch.studyYear}</td>
                      <td className="p-2">{sch.subjectName}</td>
                      <td className="p-2">{sch.instructorName}</td>
                      <td className="p-2">{sch.semesterName}</td>
                      <td className="p-2">{sch.locationName}</td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(sch)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Edito
                          </button>
                          <button
                            onClick={() => deleteSchedule(sch.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Fshij
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSchedules.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-2 text-center text-gray-500">
                      Asnjë orar nuk u gjet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal-i për Editim (shfaqet veç kur showEditModal === true) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow relative">
            {/* Butoni i mbylljes (X) */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Edito Orarin</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Lloji i eventit */}
                <div>
                  <label className="block font-medium mb-1">Lloji i Ngjarjes</label>
                  <input
                    {...register("eventType")}
                    placeholder="p.sh. Ligjerata ose Ushtrime"
                    className="border p-1 rounded w-full"
                  />
                </div>

                {/* Dita e Javës (shumësia e ditëve, ose një e vetme) */}
                <div>
                  <label className="block font-medium mb-1">Dita e Javës</label>
                  <select
                    {...register("daysOfWeek")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Ditën --</option>
                    {DAY_OPTIONS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ora e fillimit */}
                <div>
                  <label className="block font-medium mb-1">Ora e Fillimit</label>
                  <input
                    type="time"
                    {...register("startTime")}
                    className="border p-1 rounded w-full"
                  />
                </div>

                {/* Ora e përfundimit */}
                <div>
                  <label className="block font-medium mb-1">Ora e Përfundimit</label>
                  <input
                    type="time"
                    {...register("endTime")}
                    className="border p-1 rounded w-full"
                  />
                </div>

                {/* Viti Akademik (ID, jo string) */}
                <div>
                  <label className="block font-medium mb-1">Viti Akademik</label>
                  <select
                    {...register("academicYearId")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Vitin --</option>
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Viti i Studimeve */}
                <div>
                  <label className="block font-medium mb-1">Viti i Studimeve</label>
                  <input
                    type="number"
                    {...register("studyYear")}
                    placeholder="p.sh. 2"
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

                {/* Semestri */}
                <div>
                  <label className="block font-medium mb-1">Semestri</label>
                  <select
                    {...register("semesterId")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Semestrin --</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Salla */}
                <div>
                  <label className="block font-medium mb-1">Salla</label>
                  <select
                    {...register("classLocationId")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Sallën --</option>
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
      {/* fundi i modalit */}
    </div>
  );
};

export default SchedulesAdminPage;
