import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";
import FilterPanel from "@/components/FilterPanel";

interface FilterOptions {
  academicYear: string; // "All Years" ose id‑ja e vitit akademik
  semester: string;     // "All Semesters" ose emri i semestrit
  yearOfStudy: string;  // "All Years" ose numër
}

interface ScheduleItem {
  id: string;
  eventType: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];       // vlera në anglisht
  academicYearId: string|null;
  studyYear: number;
  subjectName: string;
  instructorName: string;
  semesterName: string;
  locationName: string;
  subjectId: string;
  instructorId: string;
  semesterId: string;
  classLocationId: string;
}

interface SubjectData    { id: string; name: string; code: string; }
interface InstructorData { id: string; name: string; role: string; }
interface SemesterData   { id: string; name: string; }
interface ClassLocationData { id: string; roomName: string; }
interface AcademicYearItem { id: string; name: string; isActive: boolean; }

/* -------------------------------------------------------
   Ditët e javës: vlera => etiketë (anglisht => shqip)
-------------------------------------------------------- */
const DAY_OPTIONS = [
  { value: "Monday",    label: "E hënë"    },
  { value: "Tuesday",   label: "E martë"   },
  { value: "Wednesday", label: "E mërkurë" },
  { value: "Thursday",  label: "E enjte"   },
  { value: "Friday",    label: "E premte"  },
  { value: "Saturday",  label: "E shtunë"  },
  { value: "Sunday",    label: "E diel"    },
] as const;

// Krijojmë map për kthim të shpejtë (p.sh. Monday -> E hënë)
const DAY_LABELS: Record<string, string> = DAY_OPTIONS.reduce(
  (acc, cur) => ({ ...acc, [cur.value]: cur.label }),
  {} as Record<string, string>
);

const SchedulesAdminPage: React.FC = () => {
  /* ------------------- state‑et kryesore ------------------- */
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    academicYear: "",
    semester: "",
    yearOfStudy: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<any>();

  const [subjects, setSubjects]       = useState<SubjectData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [semesters, setSemesters]     = useState<SemesterData[]>([]);
  const [locations, setLocations]     = useState<ClassLocationData[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);

  /* --------------------- API thirrjet --------------------- */
  async function fetchSchedules() {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ScheduleItem[]>("/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error("Gabim gjatë marrjes së orareve:", err);
    } finally {
      setLoading(false);
    }
  }

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
    } catch (err) {
      console.error("Gabim gjatë marrjes së dropdown‑eve:", err);
    }
  }

  async function fetchAcademicYears() {
    try {
      const res = await axiosInstance.get<AcademicYearItem[]>("/academic-year");
      setAcademicYears(res.data.filter((ay) => ay.isActive));
    } catch (err) {
      console.error("Gabim gjatë viteve akademike:", err);
    }
  }

  useEffect(() => {
    fetchSchedules();
    fetchDropdownData();
    fetchAcademicYears();
  }, []);

  /* -------------------- filtrimi lokal -------------------- */
  const filteredSchedules = schedules.filter((sch) => {
    if (
      filters.academicYear !== "All Years" &&
      sch.academicYearId !== filters.academicYear
    )
      return false;
    if (
      filters.semester !== "All Semesters" &&
      sch.semesterName !== filters.semester
    )
      return false;
    if (filters.yearOfStudy !== "All Years") {
      const y = parseInt(filters.yearOfStudy.replace(/\D/g, ""), 10);
      if (sch.studyYear !== y) return false;
    }
    return true;
  });

  /* -------------------- editimi i orarit ------------------- */
  const startEdit = (sch: ScheduleItem) => {
    setEditId(sch.id);
    setValue("eventType", sch.eventType);
    setValue("startTime", sch.startTime);
    setValue("endTime", sch.endTime);
    setValue("academicYearId", sch.academicYearId || "");
    setValue("studyYear", String(sch.studyYear));
    setValue("subjectId", sch.subjectId);
    setValue("instructorId", sch.instructorId);
    setValue("semesterId", sch.semesterId);
    setValue("classLocationId", sch.classLocationId);
    setValue("daysOfWeek", sch.daysOfWeek);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setEditId(null);
    reset({});
    setShowEditModal(false);
  };
  const [startTimeInput, setStartTimeInput] = useState("");
  const [endTimeInput, setEndTimeInput] = useState("");
  const handleTimeInputChange = (value: string, setter: (val: string) => void) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
  
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
    }
  
    setter(cleaned);
  };
  
  const onSubmit = async (data: any) => {
    data.startTime = normalizeTime(data.startTime);
  data.endTime = normalizeTime(data.endTime);
    if (!editId) return;
    try {
      let daysArr = data.daysOfWeek || [];
      if (typeof daysArr === "string") daysArr = [daysArr];
      const numericYear = parseInt(data.studyYear, 10) || 1;

      await axiosInstance.put(`/schedules/${editId}`, {
        eventType: data.eventType,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: daysArr, // mbeten në anglisht
        academicYearId: data.academicYearId,
        studyYear: numericYear,
        subjectId: data.subjectId,
        instructorId: data.instructorId,
        semesterId: data.semesterId,
        classLocationId: data.classLocationId,
      });

      fetchSchedules();
      closeModal();
    } catch (err) {
      console.error("Gabim gjatë përditësimit:", err);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë orar?"))
      return;
    try {
      await axiosInstance.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      console.error("Gabim gjatë fshirjes:", err);
    }
  };
  const normalizeTime = (val) => {
    const match = val.match(/^(\d{1,2}):?(\d{2})$/);
    if (!match) return val;
    let [_, h, m] = match;
    let hour = Math.min(Math.max(parseInt(h), 0), 23);
    let minute = Math.min(Math.max(parseInt(m), 0), 59);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };
  
  const formatMaskedTime = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 4); // only digits, max 4
    const chars = cleaned.split("");
  
    return `${chars[0] ?? "-"}${chars[1] ?? "-"}:${chars[2] ?? "-"}${chars[3] ?? "-"}`;
  };
  

  /* ------------------------- JSX ------------------------- */
  return (
    <div className="w-full px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-4">Menaxho Orare</h1>

      {/* Filter Panel */}
      <div className="mb-6">
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Tabela e orareve */}
      <div className="bg-white p-4 rounded shadow w-full">
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
                        {sch.daysOfWeek
                          .map((d) => DAY_LABELS[d] || d)
                          .join(", ")}
                      </td>
                      <td className="p-2">{yearObj?.name || "—"}</td>
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

      {/* Modal‑i për Editim */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow relative">
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

                {/* Dita e Javës */}
                <div>
                  <label className="block font-medium mb-1">Dita e Javës</label>
                  <select
                    {...register("daysOfWeek")}
                    className="border p-1 rounded w-full"
                  >
                    <option value="">-- Zgjidh Ditën --</option>
                    {DAY_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ora e fillimit */}
             {/* Ora e Fillimit */}
{/* Ora e Fillimit */}
{/* Ora e Fillimit */}
<div>
  <label className="block font-medium mb-1">Ora e Fillimit</label>
  <input
    type="text"
    inputMode="numeric"
    value={formatMaskedTime(startTimeInput)}
    onChange={(e) => {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
      setStartTimeInput(digitsOnly);
    }}
    onBlur={() => setStartTimeInput(normalizeTime(startTimeInput).replace(":", ""))}
    className="border p-1 rounded w-full text-center font-normal tracking-widest"
  />
</div>

{/* Ora e Përfundimit */}
<div>
  <label className="block font-medium mb-1">Ora e Përfundimit</label>
  <input
    type="text"
    inputMode="numeric"
    value={formatMaskedTime(endTimeInput)}
    onChange={(e) => {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
      setEndTimeInput(digitsOnly);
    }}
    onBlur={() => setEndTimeInput(normalizeTime(endTimeInput).replace(":", ""))}
    className="border p-1 rounded w-full text-center font-normal tracking-widest"
  />
</div>



                {/* Viti Akademik */}
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
    </div>
  );
};

export default SchedulesAdminPage;
