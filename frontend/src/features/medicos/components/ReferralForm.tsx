import React from 'react';
import UnidadAutocomplete from './UnidadAutocomplete';
import EspecialidadAutocomplete from './EspecialidadAutocomplete';

export type FormData = Record<string, any>;

type Props = {
  formData?: FormData;
  readOnly?: boolean;
  onChange?: (key: string, value: any) => void;
  onSubmit?: (e: React.FormEvent) => void;
  unidades?: any[];
  especialidades?: any[];
  // handlers opcionales para autocompletes (si quieres integrar los autocomplete reales)
  onSelectUnidadOrigen?: (u: any) => void;
  onSelectUnidadDestino?: (u: any) => void;
  onSelectEspecialidad?: (s: any) => void;
};

const Field = ({ label, children }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

// --- added: VitalField helper for consistent layout/alignment ---
const VitalField = ({ label, children }: any) => (
  <div className="flex flex-col">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <div className="mt-0">
      {children}
    </div>
  </div>
);

export default function ReferralForm({
  formData = {},
  readOnly = false,
  onChange,
  onSubmit,
  unidades = [],
  especialidades = [],
  onSelectEspecialidad,
  onSelectUnidadDestino,
}: Props) {
  const fd = formData || {};
  // debug rápido (borra en producción)
  React.useEffect(() => { console.debug('[ReferralForm] unidades recibidas:', unidades?.length); }, [unidades]);
  React.useEffect(() => { console.debug('[ReferralForm] especialidades recibidas:', especialidades?.length); }, [especialidades]);

  const handleChange = (k: string, v: any) => {
    if (readOnly) return;
    onChange?.(k, v);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Hoja de Referencia Médica</h1>
          <hr className="mt-3 border-t-2 border-blue-200" />
        </header>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Sección 1 */}
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Información de la Solicitud</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Field label="Tipo de solicitud">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input  type="radio" name="tipo_solicitud" value="programada" checked={fd.tipo_solicitud === 'programada'} onChange={(e)=>handleChange('tipo_solicitud', e.target.value)} disabled={readOnly}/>
                      <span>Programada</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="tipo_solicitud" value="urgente" checked={fd.tipo_solicitud === 'urgente'} onChange={(e)=>handleChange('tipo_solicitud', e.target.value)} disabled={readOnly}/>
                      <span>Urgente</span>
                    </label>
                  </div>
                </Field>
              </div>

              <div>
                <Field label="Tipo de paciente">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="tipo_paciente" value="trabajador" checked={fd.tipo_paciente === 'trabajador'} onChange={(e)=>handleChange('tipo_paciente', e.target.value)} disabled={readOnly}/>
                      <span>Trabajador</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="tipo_paciente" value="beneficiario" checked={fd.tipo_paciente === 'beneficiario'} onChange={(e)=>handleChange('tipo_paciente', e.target.value)} disabled={readOnly}/>
                      <span>Beneficiario</span>
                    </label>
                  </div>
                </Field>
              </div>

              <div>
                <Field label="No. Expediente">
                  <input value={fd.no_expediente ?? ''} onChange={(e)=>handleChange('no_expediente', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="No. de solicitud y/o folio">
                  <input value={fd.no_folio ?? ''} onChange={(e)=>handleChange('no_folio', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Fecha de solicitud">
                  <input type="date" value={fd.fecha_solicitud ? fd.fecha_solicitud.split('T')[0] : (fd.fecha_solicitud ?? '')} onChange={(e)=>handleChange('fecha_solicitud', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>
            </div>
          </fieldset>

          {/* Identificación del paciente */}
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Identificación del Paciente</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <Field label="Apellido Paterno">
                  <input value={fd.app_paterno ?? ''} onChange={(e)=>handleChange('app_paterno', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Apellido Materno">
                  <input value={fd.app_materno ?? ''} onChange={(e)=>handleChange('app_materno', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Nombre(s)">
                  <input value={fd.nombre_paciente ?? ''} onChange={(e)=>handleChange('nombre_paciente', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div className="md:col-span-3">
                <Field label="Domicilio">
                  <input value={fd.domicilio ?? ''} onChange={(e)=>handleChange('domicilio', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Fecha de nacimiento">
                  <input type="date" value={fd.fecha_nacimiento ?? ''} onChange={(e)=>handleChange('fecha_nacimiento', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Edad">
                  <input value={fd.edad ?? ''} readOnly className="mt-1 w-full p-2 border border-gray-200 rounded-md bg-gray-50"/>
                </Field>
              </div>

              <div>
                <Field label="Sexo">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="sexo" value="mujer" checked={fd.sexo === 'mujer'} onChange={(e)=>handleChange('sexo', e.target.value)} disabled={readOnly}/> Mujer</label>
                    <label className="flex items-center gap-2"><input type="radio" name="sexo" value="hombre" checked={fd.sexo === 'hombre'} onChange={(e)=>handleChange('sexo', e.target.value)} disabled={readOnly}/> Hombre</label>
                  </div>
                </Field>
              </div>

              <div>
                <Field label="C.U.R.P.">
                  <input value={fd.curp ?? ''} onChange={(e)=>handleChange('curp', e.target.value)} readOnly={readOnly} maxLength={18} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Familiar responsable">
                  <input value={fd.familiar_responsable ?? ''} onChange={(e)=>handleChange('familiar_responsable', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Número telefónico">
                  <input value={fd.telefono ?? ''} onChange={(e)=>handleChange('telefono', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>
            </div>
          </fieldset>

          {/* Unidad solicitante y servicio */}
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Información de la Unidad Solicitante</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Field label="Institución solicitante">
                  <input value={fd.institucion ?? ''} onChange={(e)=>handleChange('institucion', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Unidad médica que solicita">
                  {readOnly ? (
                    <input value={fd.unidad_destino_nombre ?? fd.unidad_medica ?? ''} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50"/>
                  ) : (
                    <UnidadAutocomplete
                      unidades={unidades}
                      value={fd.unidad_destino_nombre ?? fd.unidad_medica ?? ''}
                      onChange={(v: string) => handleChange('unidad_destino_nombre', v)}
                      onSelect={(u: any) => {
                        handleChange('unidad_destino_nombre', u?.nombre ?? u?.name ?? '');
                        handleChange('id_unidad_destino', u?.id_unidad ?? u?.id ?? null);
                        if (typeof onSelectUnidadDestino === 'function') onSelectUnidadDestino(u);
                      }}
                    />
                  )}
                </Field>
              </div>

              <div>
                <Field label="Prioridad">
                  <select value={fd.prioridad ?? 'Media'} onChange={(e)=>handleChange('prioridad', e.target.value)} disabled={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Servicio que solicita">
                  {readOnly ? (
                    <input value={fd.servicio ?? ''} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50"/>
                  ) : (
                    <EspecialidadAutocomplete
                      especialidades={especialidades}
                      value={fd.servicio ?? ''}
                      onChange={(v: string) => { handleChange('servicio', v); handleChange('id_especialidad_solicitada', null); }}
                      onSelect={(s: any) => {
                        const id = s?.id_especialidad ?? s?.id ?? null;
                        handleChange('servicio', s?.nombre ?? s?.name ?? '');
                        handleChange('id_especialidad_solicitada', id);
                        if (typeof onSelectEspecialidad === 'function') onSelectEspecialidad(s);
                      }}
                    />
                  )}
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Diagnóstico(s) de envío">
                  <textarea value={fd.diagnostico_envio ?? ''} onChange={(e)=>handleChange('diagnostico_envio', e.target.value)} readOnly={readOnly} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Motivo de envío">
                  <textarea value={fd.motivo_envio ?? ''} onChange={(e)=>handleChange('motivo_envio', e.target.value)} readOnly={readOnly} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>
            </div>
          </fieldset>

          {/* Resumen Clínico y Signos Vitales */}
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Resumen Clínico</legend>
            <div className="mt-4">
              <Field label="Resumen Clínico">
                <textarea value={fd.resumen_clinico ?? ''} onChange={(e)=>handleChange('resumen_clinico', e.target.value)} readOnly={readOnly} rows={6} className="mt-1 w-full p-3 border border-gray-300 rounded-md"/>
              </Field>
            </div>

            <h3 className="text-md font-semibold text-gray-700 mt-6 mb-3">Signos Vitales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <VitalField label="PESO (kg)">
                <input type="number" step="0.1" value={fd.peso ?? ''} onChange={(e)=>handleChange('peso', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="TALLA (cm)">
                <input type="number" step="1" value={fd.talla ?? ''} onChange={(e)=>handleChange('talla', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="FC (lpm)">
                <input type="number" value={fd.fc ?? ''} onChange={(e)=>handleChange('fc', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="FR (rpm)">
                <input type="number" value={fd.fr ?? ''} onChange={(e)=>handleChange('fr', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="TEMP (°C)">
                <input type="number" step="0.1" value={fd.temp ?? ''} onChange={(e)=>handleChange('temp', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="T/A (mmHg)">
                <input value={fd.ta ?? ''} onChange={(e)=>handleChange('ta', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="SPO2 (%)">
                <input type="number" value={fd.spo2 ?? ''} onChange={(e)=>handleChange('spo2', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
              <VitalField label="DEXTROSTIX">
                <input type="number" value={fd.dextrostix ?? ''} onChange={(e)=>handleChange('dextrostix', e.target.value)} readOnly={readOnly} className="w-full p-2 h-10 border border-gray-300 rounded-md"/>
              </VitalField>
            </div>
          </fieldset>

          {/* Autorización */}
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Autorización</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Field label="Nombre y clave del médico solicitante">
                  <input value={fd.medico_solicitante ?? ''} onChange={(e)=>handleChange('medico_solicitante', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>

              <div>
                <Field label="Nombre y clave del directivo que autoriza">
                  <input value={fd.directivo_autoriza ?? ''} onChange={(e)=>handleChange('directivo_autoriza', e.target.value)} readOnly={readOnly} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                </Field>
              </div>
            </div>
          </fieldset>

          {!readOnly && (
            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => history.back()} className="px-5 py-3 bg-gray-200 rounded-md hover:bg-gray-300">Salir</button>
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Guardar y Enviar Referencia</button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}