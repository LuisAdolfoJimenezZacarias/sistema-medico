import React from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useAuth } from "../../../context/auth-context";

type Referral = {
  id: number;
  nombre_paciente?: string;
  app_paterno?: string;
  institucion_origen?: string;
  createdAt?: string;
  status?: string;
};

export default function ReferenciasRecibidas(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const unitId = (user as any)?.facilityId ?? (user as any)?.facility ?? "";
  const [items, setItems] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals?toUnit=${encodeURIComponent(unitId)}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      addToast({ title: "Error", description: "No se pudieron cargar referencias.", color: "danger" });
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  React.useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      addToast({ title: "OK", description: `Referencia ${status === "accepted" ? "aceptada" : "rechazada"}.`, color: "success" });
    } catch (err) {
      console.error(err);
      addToast({ title: "Error", description: "No se pudo actualizar el estado.", color: "danger" });
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Bandeja de Entrada (Referencias Recibidas)</h2>
        <div className="text-sm text-muted">Unidad: {(user as any)?.facility || "—"}</div>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p>No hay referencias recibidas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-2 border-b">Paciente</th>
                <th className="p-2 border-b">Unidad Origen</th>
                <th className="p-2 border-b">Fecha</th>
                <th className="p-2 border-b">Estado</th>
                <th className="p-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border-b">{`${r.app_paterno ?? ""} ${r.nombre_paciente ?? ""}`.trim() || "—"}</td>
                  <td className="p-2 border-b">{r.institucion_origen ?? "—"}</td>
                  <td className="p-2 border-b">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                  <td className="p-2 border-b capitalize">{r.status ?? "pendiente"}</td>
                  <td className="p-2 border-b">
                    {r.status === "pending" || !r.status ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(r.id, "accepted")} className="px-3 py-1 bg-green-600 text-white rounded">Aceptar</button>
                        <button onClick={() => updateStatus(r.id, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded">Rechazar</button>
                        <button onClick={() => navigate(`/doctor/referrals/${r.id}`)} className="px-3 py-1 bg-gray-200 rounded">Ver</button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">Acción realizada</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}