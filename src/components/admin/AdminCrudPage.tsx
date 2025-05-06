import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";

/* -------------------- Tipet / Modelet -------------------- */
type ResourceType =
  | "semesters"
  | "instructors"
  | "subjects"
  | "class-locations"
  | "afati"
  | "academic-year"
  | "emailList";

interface Semester       { id: string; name: string }
interface Instructor     { id: string; name: string; role: string }
interface Subject        { id: string; name: string }
interface ClassLocation  { id: string; roomName: string }
interface Afati          { id: string; name: string }
interface AcademicYear   { id: string; name: string; isActive: boolean }
interface ListEmail      { id: string; name: string; emails: string[] }

type ResourceItem =
  | Semester
  | Instructor
  | Subject
  | ClassLocation
  | Afati
  | AcademicYear
  | ListEmail;

/* ========================================================= */

const AdminCrudPage: React.FC = () => {
  const [resource, setResource] = useState<ResourceType>("semesters");
  const [items, setItems]       = useState<ResourceItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);

  /* React-hook-form --------------------------------------- */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>();

  /* ---------------- API fetch për listën ---------------- */
  async function fetchItems() {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/${resource}`);
      setItems(res.data);
    } catch (error) {
      console.error("Gabim në marrjen e të dhënave:", error);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- kur ndryshon resource ---------------- */
  useEffect(() => {
    fetchItems();
    setEditId(null);

    switch (resource) {
      case "instructors":
        reset({ name: "", role: "Asistent" });
        break;
      case "academic-year":
        reset({ name: "", isActive: false });
        break;
      case "class-locations":
        reset({ roomName: "" });
        break;
      default:
        reset({ name: "" });
    }
  }, [resource]);

  /* ---------------- POST / PUT ---------------- */
  const onSubmit = async (data: any) => {
    try {
      if (resource === "emailList" && typeof data.emails === "string") {
        data.emails = data.emails.split(",").map((e: string) => e.trim());
      }

      if (editId) {
        await axiosInstance.put(`/${resource}/${editId}`, data);
      } else {
        await axiosInstance.post(`/${resource}`, data);
      }

      setEditId(null);
      reset();
      fetchItems();
    } catch (error) {
      console.error("Gabim në ruajtje:", error);
    }
  };

  /* ---------------- Fillim editimi ---------------- */
  const startEdit = (item: ResourceItem) => {
    setEditId((item as any).id);

    switch (resource) {
      case "semesters":
        setValue("name", (item as Semester).name);
        break;
      case "instructors":
        setValue("name", (item as Instructor).name);
        setValue("role", (item as Instructor).role);
        break;
      case "subjects":
        setValue("name", (item as Subject).name);
        break;
      case "class-locations":
        setValue("roomName", (item as ClassLocation).roomName);
        break;
      case "afati":
        setValue("name", (item as Afati).name);
        break;
      case "academic-year":
        setValue("name", (item as AcademicYear).name);
        setValue("isActive", (item as AcademicYear).isActive);
        break;
      case "emailList":
        setValue("name", (item as ListEmail).name);
        setValue("emails", (item as ListEmail).emails.join(", "));
        break;
    }
  };

  /* ---------------- Delete ---------------- */
  const deleteItem = async (id: string) => {
    if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë artikull?"))
      return;
    try {
      await axiosInstance.delete(`/${resource}/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Gabim në fshirje:", error);
    }
  };

  /* ---------------- Form fields ---------------- */
  function renderFormFields() {
    switch (resource) {
      /* ---------- Semestrat ---------- */
      case "semesters":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Semestrit</label>
            <input
              {...register("name", { required: "Fusha është e detyrueshme" })}
              placeholder="p.sh. Vjeshta"
              className="border px-3 py-1 rounded w-full"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name?.message as string}
              </p>
            )}
          </>
        );

      /* ---------- Profesorët ---------- */
      case "instructors":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Profesorit</label>
            <input
              {...register("name", { required: "Fusha është e detyrueshme" })}
              placeholder="p.sh. Prof. John Doe"
              className="border px-3 py-1 rounded w-full"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name?.message as string}
              </p>
            )}

            <label className="block font-medium mt-2">Roli</label>
            <select
              {...register("role", { required: true })}
              className="border px-3 py-1 rounded w-full"
            >
              <option value="Asistent">Asistent</option>
              <option value="Profesor">Profesor</option>
            </select>
          </>
        );

      /* ---------- Lëndët ---------- */
      case "subjects":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Lëndës</label>
            <input
              {...register("name", { required: "Fusha është e detyrueshme" })}
              placeholder="p.sh. Matematika 1"
              className="border px-3 py-1 rounded w-full"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name?.message as string}
              </p>
            )}
          </>
        );

      /* ---------- Sallat ---------- */
      case "class-locations":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Sallës</label>
            <input
              {...register("roomName", { required: "Fusha është e detyrueshme" })}
              placeholder="p.sh. Salla 205"
              className="border px-3 py-1 rounded w-full"
            />
            {errors.roomName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.roomName?.message as string}
              </p>
            )}
          </>
        );

      /* ---------- Afatet ---------- */
      case "afati":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Afatit</label>
            <input
              {...register("name", { required: "Fusha është e detyrueshme" })}
              placeholder="p.sh. Qershor"
              className="border px-3 py-1 rounded w-full"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name?.message as string}
              </p>
            )}
          </>
        );

      /* ---------- Vitet Akademike ---------- */
      case "academic-year":
        return (
          <>
            <label className="block font-medium mt-2">
              Emri i Vitit Akademik
            </label>
            <input
              {...register("name", {
                required: "Fusha është e detyrueshme",
                pattern: {
                  value: /^\d{4}\/\d{2}$/,
                  message: "Formati duhet të jetë p.sh. 2025/26",
                },
              })}
              placeholder="p.sh. 2025/26"
              className="border px-3 py-1 rounded w-full"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name?.message as string}
              </p>
            )}

            <label className="block font-medium mt-2">Aktiv?</label>
            <input type="checkbox" {...register("isActive")} className="mr-2" />
            <span className="text-sm">
              Po (Nëse e lini të shënuar, viti do të jetë aktiv)
            </span>
          </>
        );

      /* ---------- Lista e emailave ---------- */
      case "emailList":
        return (
          <>
            <label className="block font-medium mt-2">
              Emri i Listës së Emailave
            </label>
            <input
              {...register("name", { required: "Fusha është e detyrueshme" })}
              className="border px-3 py-1 rounded w-full"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.name?.message as string}
              </p>
            )}

            <label className="block font-medium mt-2">
              Emailat (ndaj me presje)
            </label>
            <textarea
              {...register("emails", { required: "Fusha është e detyrueshme" })}
              className="border px-3 py-1 rounded w-full"
            />
            {errors.emails && (
              <p className="text-red-600 text-sm mt-1">
                {errors.emails?.message as string}
              </p>
            )}
          </>
        );
    }
  }

  /* ---------------- Table headers ---------------- */
  function renderTableHeaders() {
    switch (resource) {
      case "semesters":
      case "subjects":
      case "class-locations":
      case "afati":
        return <th className="p-2 text-left">Emri</th>;

      case "instructors":
        return (
          <>
            <th className="p-2 text-left">Emri</th>
            <th className="p-2 text-left">Roli</th>
          </>
        );

      case "academic-year":
        return (
          <>
            <th className="p-2 text-left">Emri</th>
            <th className="p-2 text-left">Aktiv?</th>
          </>
        );

      case "emailList":
        return (
          <>
            <th className="p-2 text-left">Emri i Listës</th>
            <th className="p-2 text-left">Numri i Emailave</th>
          </>
        );
    }
  }

  /* ---------------- Table rows ---------------- */
  function renderTableRow(item: ResourceItem) {
    switch (resource) {
      case "semesters":
        return <td className="p-2">{(item as Semester).name}</td>;

      case "instructors":
        return (
          <>
            <td className="p-2">{(item as Instructor).name}</td>
            <td className="p-2">{(item as Instructor).role}</td>
          </>
        );

      case "subjects":
        return <td className="p-2">{(item as Subject).name}</td>;

      case "class-locations":
        return <td className="p-2">{(item as ClassLocation).roomName}</td>;

      case "afati":
        return <td className="p-2">{(item as Afati).name}</td>;

      case "academic-year":
        return (
          <>
            <td className="p-2">{(item as AcademicYear).name}</td>
            <td className="p-2">
              {(item as AcademicYear).isActive ? "Po" : "Jo"}
            </td>
          </>
        );

      case "emailList":
        return (
          <>
            <td className="p-2">{(item as ListEmail).name}</td>
            <td className="p-2">
              {(item as ListEmail).emails?.length ?? 0}
            </td>
          </>
        );
    }
  }

  /* ========================================================= */

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Konfigurimet</h1>

      {/* ---------------- Selector ---------------- */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <label className="font-semibold mr-2">Zgjidh Burimin:</label>
        <select
          value={resource}
          onChange={(e) => setResource(e.target.value as ResourceType)}
          className="border px-3 py-1 rounded"
        >
          <option value="semesters">Semestrat</option>
          <option value="instructors">Profesorët</option>
          <option value="subjects">Lëndët</option>
          <option value="class-locations">Sallat</option>
          <option value="afati">Afatet</option>
          <option value="academic-year">Vitet Akademike</option>
          <option value="emailList">Listat e Emailave</option>
        </select>
      </div>

      {/* ---------------- Form ---------------- */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">
          {editId ? "Përditëso Artikullin" : "Krijo Artikull të Ri"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderFormFields()}

          <div className="mt-4 space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
            >
              {editId ? "Përditëso" : "Krijo"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  reset({});
                }}
                className="bg-gray-400 text-white px-4 py-1.5 rounded hover:bg-gray-500 transition"
              >
                Anulo
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Artikujt Ekzistues</h2>

        {loading ? (
          <p>Duke ngarkuar {resource}...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  {renderTableHeaders()}
                  <th className="p-2 text-left">Veprime</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={(item as any).id} className="border-b">
                    {renderTableRow(item)}
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Edito
                      </button>
                      <button
                        onClick={() => deleteItem((item as any).id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                      >
                        Fshij
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={resource === "instructors" ? 3 : 2}
                      className="p-2 text-center text-gray-500"
                    >
                      Asnjë artikull nuk u gjet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCrudPage;
