import React from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";

type ContrarreferenciaForm = {
  no_expediente?: string;
  telefono?: string;
  app_paterno?: string;
  app_materno?: string;
  nombre_paciente?: string;
  domicilio?: string;
  edad?: string;
  sexo?: "mujer" | "hombre";
  curp?: string;

  fecha_ingreso?: string;
  fecha_egreso?: string;
  institucion_recibio?: string;
  dias_atendidos?: string;
  unidad_medica_solicito?: string;
  servicio_recibio?: string;

  diagnostico_egreso?: string;
  diagnostico_complicaciones?: string;
  resumen_clinico?: string;

  medico_tratante?: string;
  director_unidad?: string;
};

export default function NuevaContrarreferencia(): JSX.Element {
  const navigate = useNavigate();
  const [form, setForm] = React.useState<ContrarreferenciaForm>({
    sexo: undefined,
    fecha_ingreso: "",
    fecha_egreso: "",
  });

  
  const handleChange = (k: keyof ContrarreferenciaForm, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();

    // Validación simple
    if (!form.app_paterno || !form.nombre_paciente || !form.fecha_egreso) {
      addToast({
        title: "Error",
        description: "Complete Apellido Paterno, Nombre y Fecha de Egreso.",
        color: "danger",
      });
      return;
    }
      // Envío simulado
    console.log("Contrarreferencia:", form);
    addToast({
      title: "Contrarreferencia guardada",
      description: "La contrarreferencia se guardó correctamente.",
      color: "success",
    });

    navigate("/doctor/referrals");
  };
  return (
    <div className="bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-4">
          Nota de Egreso y Contrarreferencia
        </h1>

        <form onSubmit={handleSubmit} id="contrarreferenciaForm">
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Identificación del Paciente</legend>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">No. De Expediente</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.no_expediente ?? ""} onChange={(e) => handleChange("no_expediente", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">No. De Teléfono</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.telefono ?? ""} onChange={(e) => handleChange("telefono", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.app_paterno ?? ""} onChange={(e) => handleChange("app_paterno", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido Materno</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.app_materno ?? ""} onChange={(e) => handleChange("app_materno", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.nombre_paciente ?? ""} onChange={(e) => handleChange("nombre_paciente", e.target.value)} />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700">Domicilio</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.domicilio ?? ""} onChange={(e) => handleChange("domicilio", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <input type="number" className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.edad ?? ""} onChange={(e) => handleChange("edad", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                <div className="flex gap-4">
                  <label className="radio-label flex-1">
                    <input type="radio" name="sexo" value="mujer" checked={form.sexo === "mujer"} onChange={() => handleChange("sexo", "mujer")} />
                    <div className="radio-custom-dot" />
                    <span>Mujer</span>
                  </label>
                  <label className="radio-label flex-1">
                    <input type="radio" name="sexo" value="hombre" checked={form.sexo === "hombre"} onChange={() => handleChange("sexo", "hombre")} />
                    <div className="radio-custom-dot" />
                    <span>Hombre</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">C.U.R.P.</label>
                <input maxLength={18} className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.curp ?? ""} onChange={(e) => handleChange("curp", e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-8 border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Información del Egreso</legend>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
                <input type="date" className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.fecha_ingreso ?? ""} onChange={(e) => handleChange("fecha_ingreso", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Fecha de Egreso</label>
                <input type="date" className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.fecha_egreso ?? ""} onChange={(e) => handleChange("fecha_egreso", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Institución que recibió</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.institucion_recibio ?? ""} onChange={(e) => handleChange("institucion_recibio", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Total de días atendidos</label>
                <input type="number" className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.dias_atendidos ?? ""} onChange={(e) => handleChange("dias_atendidos", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Unidad médica que solicitó (origen)</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.unidad_medica_solicito ?? ""} onChange={(e) => handleChange("unidad_medica_solicito", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Servicio que recibió (en esta unidad)</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.servicio_recibio ?? ""} onChange={(e) => handleChange("servicio_recibio", e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-8 border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Diagnóstico y Resumen</legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnóstico(s) egreso</label>
                <textarea rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.diagnostico_egreso ?? ""} onChange={(e) => handleChange("diagnostico_egreso", e.target.value)} placeholder="(Catálogo de intervenciones)"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnóstico por complicaciones</label>
                <textarea rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.diagnostico_complicaciones ?? ""} onChange={(e) => handleChange("diagnostico_complicaciones", e.target.value)} placeholder="Complicaciones durante la estancia"></textarea>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Resumen clínico</label>
              <textarea rows={5} className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.resumen_clinico ?? ""} onChange={(e) => handleChange("resumen_clinico", e.target.value)} placeholder="Principales datos del interrogatorio..."></textarea>
            </div>
          </fieldset>

          <fieldset className="mt-8 border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Firmas de Egreso</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre, clave y firma del médico tratante</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.medico_tratante ?? ""} onChange={(e) => handleChange("medico_tratante", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre, clave y firma del Director de la Unidad</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={form.director_unidad ?? ""} onChange={(e) => handleChange("director_unidad", e.target.value)} />
              </div>
            </div>
          </fieldset>

          <div className="mt-10 flex justify-end gap-4">
            <button type="button" onClick={() => navigate("/doctor/referrals")} className="px-6 py-3 bg-gray-200 rounded-md hover:bg-gray-300">
              Salir
            </button>

            <button type="submit" className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700">
              Guardar Contrarreferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}