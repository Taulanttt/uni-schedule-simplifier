import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";

// 1) Zgjedhim llojet e mundshme të burimeve
type ResourceType =
  | "semesters"
  | "instructors"
  | "subjects"
  | "class-locations"
  | "afati"
  | "academic-year";  // SHTUAR

// 2) Definojmë strukturat bazë
interface Semester {
  id: string;
  name: string;
}
interface Instructor {
  id: string;
  name: string;
  role: string;
}
interface Subject {
  id: string;
  name: string;
}
interface ClassLocation {
  id: string;
  roomName: string;
}
interface Afati {
  id: string;
  name: string;
}

// SHTOJMË modelin e vitit akademik
interface AcademicYear {
  id: string;
  name: string;
  isActive: boolean;
}

// 3) Unifikojmë të gjitha modelet si ResourceItem
type ResourceItem =
  | Semester
  | Instructor
  | Subject
  | ClassLocation
  | Afati
  | AcademicYear;

const AdminCrudPage: React.FC = () => {
  const [resource, setResource] = useState<ResourceType>("semesters");
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // React Hook Form për Krijim / Update
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // Ruajmë ID-në e artikullit në modë "edit"
  const [editId, setEditId] = useState<string | null>(null);

  // 1) Marrim të dhënat nga backend sipas llojit të "resource"
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

  // 2) Kur ndryshon resource, rifreskojmë listën dhe pastrojmë formën
  useEffect(() => {
    fetchItems();
    setEditId(null);
  
    // Reset form depending on resource
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
        reset({ name: "" }); // for semesters, subjects, afati
    }
  }, [resource]);

  // 3) onSubmit => nëse ka editId bëjmë PUT, përndryshe POST
  const onSubmit = async (data: any) => {
    try {
      if (editId) {
        // Update
        await axiosInstance.put(`/${resource}/${editId}`, data);
      } else {
        // Create
        await axiosInstance.post(`/${resource}`, data);
      }
      fetchItems();
      reset({});
      setEditId(null);
    } catch (error) {
      console.error("Gabim në ruajtje:", error);
    }
  };

  // 4) fillojmë editimin
  const startEdit = (item: ResourceItem) => {
    setEditId((item as any).id);

    // Mbushim formën sipas resource
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
    }
  };

  // 5) Fshirja
  const deleteItem = async (id: string) => {
    if (!window.confirm("A jeni i sigurt që dëshironi ta fshini këtë artikull?")) return;
    try {
      await axiosInstance.delete(`/${resource}/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Gabim në fshirje:", error);
    }
  };

  // 6) Render fushat e formës sipas llojit
  function renderFormFields() {
    switch (resource) {
      case "semesters":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Semestrit</label>
            <input
              {...register("name")}
              placeholder="p.sh. Vjeshta"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "instructors":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Profesorit</label>
            <input
              {...register("name")}
              placeholder="p.sh. Prof. John Doe"
              className="border px-3 py-1 rounded w-full"
            />
            <label className="block font-medium mt-2">Roli</label>
            <select {...register("role")} className="border px-3 py-1 rounded w-full">
            <option value="Asistent">Asistent</option>
            <option value="Profesor">Profesor</option>
            </select>
          </>
        );
      case "subjects":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Lëndës</label>
            <input
              {...register("name")}
              placeholder="p.sh. Matematika 1"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "class-locations":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Sallës</label>
            <input
              {...register("roomName")}
              placeholder="p.sh. Salla 205"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "afati":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Afatit</label>
            <input
              {...register("name")}
              placeholder="p.sh. Qershor"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "academic-year":
        return (
          <>
            <label className="block font-medium mt-2">Emri i Vitit Akademik</label>
            <input
              {...register("name")}
              placeholder="p.sh. 2024/25"
              className="border px-3 py-1 rounded w-full"
            />
            <label className="block font-medium mt-2">Aktiv?</label>
            <input
              type="checkbox"
              {...register("isActive")}
              className="mr-2"
            />
            <span className="text-sm">Po (Nëse e lini të klikuar do të jetë aktiv)</span>
          </>
        );
    }
  }

  // 7) Tabela: kokat
  function renderTableHeaders() {
    switch (resource) {
      case "semesters":
        return <th className="p-2 text-left">Emri</th>;
      case "instructors":
        return (
          <>
            <th className="p-2 text-left">Emri</th>
            <th className="p-2 text-left">Roli</th>
          </>
        );
      case "subjects":
        return <th className="p-2 text-left">Emri</th>;
      case "class-locations":
        return <th className="p-2 text-left">Salla</th>;
      case "afati":
        return <th className="p-2 text-left">Emri</th>;
      case "academic-year":
        return (
          <>
            <th className="p-2 text-left">Emri</th>
            <th className="p-2 text-left">Aktiv?</th>
          </>
        );
    }
  }

  // 8) Tabela: rreshtat
  function renderTableRow(item: ResourceItem) {
    switch (resource) {
      case "semesters": {
        const sem = item as Semester;
        return <td className="p-2">{sem.name}</td>;
      }
      case "instructors": {
        const ins = item as Instructor;
        return (
          <>
            <td className="p-2">{ins.name}</td>
            <td className="p-2">{ins.role}</td>
          </>
        );
      }
      case "subjects": {
        const sub = item as Subject;
        return <td className="p-2">{sub.name}</td>;
      }
      case "class-locations": {
        const loc = item as ClassLocation;
        return <td className="p-2">{loc.roomName}</td>;
      }
      case "afati": {
        const a = item as Afati;
        return <td className="p-2">{a.name}</td>;
      }
      case "academic-year": {
        const ay = item as AcademicYear;
        return (
          <>
            <td className="p-2">{ay.name}</td>
            <td className="p-2">{ay.isActive ? "Po" : "Jo"}</td>
          </>
        );
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Titulli */}
      <h1 className="text-2xl font-bold mb-4">Konfigurimet</h1>

      {/* Zgjedhja e burimit */}
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
        </select>
      </div>

      {/* Forma për Krijim / Edit */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">
          {editId ? "Përditëso Artikullin" : "Krijo Artikull të Ri"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderFormFields()}

          {/* Butonat */}
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

      {/* Tabela e artikujve */}
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
                    {/* Numri i kolonave ndryshon sipas resource */}
                    <td
                      colSpan={
                        resource === "instructors"
                          ? 3
                          : resource === "afati" ||
                            resource === "academic-year"
                          ? 3
                          : resource === "subjects"
                          ? 2
                          : 2
                      }
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
