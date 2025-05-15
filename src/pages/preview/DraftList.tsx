import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface DraftRow {
  id: string;
  previewToken: string | null;
  academicYear: string;
  semesterName: string;
  studyYear: number;
  updatedAt?: string;
}

const DraftList: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<DraftRow[]>("/schedules?status=draft");
        setDrafts(res.data);
      } catch (e: any) {
        setErr("Nuk mund t’i marrim draft-et.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-center mt-10">Duke u ngarkuar…</p>;
  if (err)     return <p className="text-center mt-10 text-red-600">{err}</p>;
  if (!drafts.length)
    return <p className="text-center mt-10">S’ka asnjë draft aktualisht.</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Draftet aktive
      </h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Viti Akademik</th>
              <th className="p-3 text-left">Semestri</th>
              <th className="p-3 text-left">Viti Studimit</th>
              <th className="p-3 text-left">Përditësuar</th>
              <th className="p-3 text-left" />
            </tr>
          </thead>
          <tbody>
            {drafts.map((d, i) => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{d.academicYear}</td>
                <td className="p-3">{d.semesterName}</td>
                <td className="p-3">Viti {d.studyYear}</td>
                <td className="p-3">
                  {d.updatedAt
                    ? format(new Date(d.updatedAt), "dd.MM.yyyy")
                    : "—"}
                </td>
                <td className="p-3">
                  {d.previewToken ? (
                    <Link to={`/preview/${d.previewToken}`}>
                      <Button size="sm">Hap</Button>
                    </Link>
                  ) : (
                    <span className="text-gray-400">Pa token</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DraftList;
