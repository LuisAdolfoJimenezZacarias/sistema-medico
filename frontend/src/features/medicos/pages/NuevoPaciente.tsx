import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToast } from "@heroui/react";

interface PatientForm {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  edad: string;
  curp: string;
  fecha_nacimiento: string;
  genero: string;
  domicilio: string;
  telefono: string;
  familiar_responsable: string;
  discapacidad: string;
  nss: string;
}

const InputGroup = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}: any) => (
  <div className={`flex flex-col ${className}`}>
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-all bg-white"
    />
  </div>
);

const SelectGroup = ({ label, id, value, onChange, options, required = false }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="mt-1 w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none bg-white"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function NuevoPaciente(): JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PatientForm>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    edad: '',
    curp: '',
    fecha_nacimiento: '',
    genero: 'M',
    domicilio: '',
    telefono: '',
    familiar_responsable: '',
    discapacidad: '',
    nss: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'fecha_nacimiento') {
      const birthDate = value ? new Date(value) : null;
      if (birthDate && !isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        setFormData(prev => ({ ...prev, [name]: value, edad: String(age) }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);

    if (!formData.nombre || !formData.apellido_paterno || !formData.curp) {
      addToast({ title: 'Error', description: 'Completa los campos obligatorios: Nombre, Apellido Paterno, CURP', color: 'danger' });
      setIsSaving(false);
      return;
    }

    try {
      // obtener token (ajusta la clave si saveAuth usa otra)
      const token = localStorage.getItem('token')
        || (() => { const a = localStorage.getItem('auth') || localStorage.getItem('user'); try { const p = a && JSON.parse(a); return p?.token ?? p?.accessToken ?? null; } catch { return null; } })();

      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('API error', err);
        addToast({ title: 'Error', description: err?.message || 'Error al guardar paciente', color: 'danger' });
        setIsSaving(false);
        return;
      }

      addToast({ title: 'Paciente guardado', description: `Paciente ${formData.nombre} guardado exitosamente.`, color: 'success' });
      setIsSaving(false);
      navigate('/doctor/patients');
    } catch (error) {
      console.error('save error', error);
      addToast({ title: 'Error de red', description: 'Error de red al guardar paciente', color: 'danger' });
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-4">Registro de Paciente</h1>

        <form onSubmit={handleSubmit}>
          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Datos Personales</legend>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="nombre" value={formData.nombre} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido Materno</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input type="date" className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <input type="number" className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="edad" value={formData.edad} onChange={handleChange} placeholder="Se calcula automático" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                <select name="genero" value={formData.genero} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-6 border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Identificación Oficial</legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">C.U.R.P.</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="curp" value={formData.curp} onChange={handleChange} maxLength={18} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">N.S.S.</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="nss" value={formData.nss} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-6 border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Contacto y Domicilio</legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="telefono" value={formData.telefono} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Familiar Responsable</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="familiar_responsable" value={formData.familiar_responsable} onChange={handleChange} />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Domicilio</label>
                <input className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="domicilio" value={formData.domicilio} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-6 border border-gray-300 p-4 rounded-lg">
            <legend className="text-xl font-semibold text-gray-800 px-2">Información Adicional</legend>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Discapacidad (si aplica)</label>
              <textarea rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md" name="discapacidad" value={formData.discapacidad} onChange={handleChange} />
            </div>
          </fieldset>

          <div className="mt-10 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/doctor/patients')} className="px-6 py-3 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancelar
            </button>

            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700">
              {isSaving ? 'Guardando...' : 'Guardar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}