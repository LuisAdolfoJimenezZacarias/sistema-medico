import React from 'react';

type ViewData = Record<string, any>;

export default function ReferralView({ data = {} as ViewData }: { data?: ViewData }) {
  const d = data || {};
  const Field = ({ label, value, cols = 1 }: any) => (
    <div className={`md:col-span-${cols}`}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <div className="mt-1 w-full p-2 rounded border border-gray-200 bg-white text-sm text-gray-800">{value ?? '—'}</div>
    </div>
  );

  const Text = ({ label, value }: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <div className="mt-1 p-3 rounded border border-gray-200 bg-white text-sm whitespace-pre-wrap">{value ?? '—'}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Field label="Paciente" value={`${d.paciente?.nombre ?? d.nombre_paciente ?? ''} ${d.paciente?.apellido_paterno ?? d.app_paterno ?? ''} ${d.paciente?.apellido_materno ?? d.app_materno ?? ''}`} cols={2} />
        <Field label="CURP" value={d.paciente?.curp ?? d.curp} />
        <Field label="No. Expediente" value={d.no_expediente ?? d.expediente} />
        <Field label="Edad / Sexo" value={`${d.paciente?.edad ?? d.edad ?? 'N/A'} / ${d.paciente?.genero ?? d.sexo ?? d.tipo_paciente ?? 'N/A'}`} />
        <Field label="Prioridad" value={d.prioridad ?? 'Media'} />
        <Field label="Fecha solicitud" value={d.fecha_solicitud ? new Date(d.fecha_solicitud).toLocaleString() : ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Field label="Unidad que envía" value={d.unidad_origen?.nombre ?? d.unidad_origen_nombre ?? d.institucion} />
        <Field label="Médico remitente" value={d.medico_remitente ? `${d.medico_remitente.nombre} ${d.medico_remitente.apellido_paterno ?? ''}` : (d.medico_solicitante ?? '')} />
        <Field label="Unidad destino" value={d.unidad_destino?.nombre ?? d.unidad_destino_nombre} />
        <Field label="Especialidad" value={d.especialidad?.nombre ?? d.servicio} />
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <Text label="Motivo de envío" value={d.motivo_envio} />
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <Text label="Resumen clínico" value={d.resumen_clinico} />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Peso (kg)" value={d.peso} />
          <Field label="Talla (cm)" value={d.talla} />
          <Field label="FC" value={d.fc} />
          <Field label="FR" value={d.fr} />
          <Field label="Temp" value={d.temp} />
          <Field label="T/A" value={d.ta} />
          <Field label="SPO2" value={d.spo2} />
          <Field label="Dextrostix" value={d.dextrostix} />
        </div>
      </div>
    </div>
  );
}