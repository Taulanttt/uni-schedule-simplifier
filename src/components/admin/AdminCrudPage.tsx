import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useForm } from "react-hook-form";

// The possible resources
type ResourceType = "semesters" | "instructors" | "subjects" | "class-locations";

// Basic shapes
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
  code: string;
}
interface ClassLocation {
  id: string;
  roomName: string;
}

// A generic union of data items
type ResourceItem = Semester | Instructor | Subject | ClassLocation;

const AdminCrudPage: React.FC = () => {
  const [resource, setResource] = useState<ResourceType>("semesters");
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  // For Create/Edit form
  const { register, handleSubmit, reset, setValue } = useForm<any>();

  // For "edit mode" we store the current item ID
  const [editId, setEditId] = useState<string | null>(null);

  // 1) Fetch items from the selected resource
  async function fetchItems() {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/${resource}`);
      setItems(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2) On resource change → refetch
  useEffect(() => {
    fetchItems();
    setEditId(null);
    reset({});
  }, [resource]);

  // 3) Handle Create/Update
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
      console.error("Save error:", error);
    }
  };

  // 4) Start editing
  const startEdit = (item: ResourceItem) => {
    setEditId((item as any).id);
    // Fill the form with existing item fields
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
        setValue("code", (item as Subject).code);
        break;
      case "class-locations":
        setValue("roomName", (item as ClassLocation).roomName);
        break;
    }
  };

  // 5) Delete
  const deleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/${resource}/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // 6) Render the correct form fields
  function renderFormFields() {
    switch (resource) {
      case "semesters":
        return (
          <>
            <label className="block font-medium mt-2">Name</label>
            <input
              {...register("name")}
              placeholder="e.g. Fall"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "instructors":
        return (
          <>
            <label className="block font-medium mt-2">Name</label>
            <input
              {...register("name")}
              placeholder="Prof. John Doe"
              className="border px-3 py-1 rounded w-full"
            />
            <label className="block font-medium mt-2">Role</label>
            <input
              {...register("role")}
              placeholder="assistant"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "subjects":
        return (
          <>
            <label className="block font-medium mt-2">Name</label>
            <input
              {...register("name")}
              placeholder="Matematika 1"
              className="border px-3 py-1 rounded w-full"
            />
            <label className="block font-medium mt-2">Code</label>
            <input
              {...register("code")}
              placeholder="MAT1"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
      case "class-locations":
        return (
          <>
            <label className="block font-medium mt-2">Room Name</label>
            <input
              {...register("roomName")}
              placeholder="Room 205"
              className="border px-3 py-1 rounded w-full"
            />
          </>
        );
    }
  }

  // 7) Table columns
  function renderTableHeaders() {
    switch (resource) {
      case "semesters":
        return <th className="p-2 text-left">Name</th>;
      case "instructors":
        return (
          <>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Role</th>
          </>
        );
      case "subjects":
        return (
          <>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Code</th>
          </>
        );
      case "class-locations":
        return <th className="p-2 text-left">Room Name</th>;
    }
  }

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
        return (
          <>
            <td className="p-2">{sub.name}</td>
            <td className="p-2">{sub.code}</td>
          </>
        );
      }
      case "class-locations": {
        const loc = item as ClassLocation;
        return <td className="p-2">{loc.roomName}</td>;
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Heading */}
      <h1 className="text-2xl font-bold mb-4">Admin CRUD Page</h1>

      {/* Resource Selector */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <label className="font-semibold mr-2">Select Resource:</label>
        <select
          value={resource}
          onChange={(e) => setResource(e.target.value as ResourceType)}
          className="border px-3 py-1 rounded"
        >
          <option value="semesters">Semesters</option>
          <option value="instructors">Instructors</option>
          <option value="subjects">Subjects</option>
          <option value="class-locations">Class Locations</option>
        </select>
      </div>

      {/* Create / Edit Form */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">
          {editId ? "Edit Item" : "Create New Item"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderFormFields()}

          {/* Buttons */}
          <div className="mt-4 space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
            >
              {editId ? "Update" : "Create"}
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
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Items Table */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Existing Items</h2>

        {loading ? (
          <p>Loading {resource}...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  {renderTableHeaders()}
                  <th className="p-2 text-left">Actions</th>
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
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem((item as any).id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
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
                      No items found
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
