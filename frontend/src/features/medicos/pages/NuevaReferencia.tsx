import React from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, addToast } from "@heroui/react";
import { useAuth } from '../../../context/auth-context';

  // --- AutocompleteUnidad: nivel módulo (igual patrón que AutocompleteEspecialidad) ---
  const AutocompleteUnidad: React.FC<{
    unidades: any[];
    value?: string;
    onChange: (v: string) => void;
    onSelect: (u: any) => void;
  }> = ({ unidades, value = "", onChange, onSelect }) => {
    const [query, setQuery] = React.useState<string>(value ?? "");
    const [open, setOpen] = React.useState<boolean>(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (value !== undefined && value !== query) setQuery(value ?? "");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    React.useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const items = React.useMemo(() => {
      const q = (query ?? "").trim().toLowerCase();
      if (!q) return (unidades || []).slice();
      return (unidades || []).filter((s: any) =>
        (s.nombre ?? s.name ?? "").toLowerCase().includes(q)
      );
    }, [unidades, query]);

    const handleInput = (v: string) => {
      setQuery(v);
      onChange(v);
      setOpen(true);
    };

    const handleSelect = (u: any) => {
      const nombre = u.nombre ?? u.name ?? "";
      setQuery(nombre);
      onSelect(u);
      setOpen(false);
    };

    return (
      <div ref={containerRef} onClick={() => inputRef.current?.focus()} className="relative">
        <input
          type="text"
          ref={inputRef}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          placeholder="Escribe o selecciona la unidad"
          autoComplete="off"
        />

        {open && items.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
            {items.map((s: any) => (
              <li
                key={s.id_unidad ?? s.id}
                onMouseDown={(ev) => { ev.preventDefault(); handleSelect(s); }}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              >
                {s.nombre ?? s.name}
              </li>
            ))}
          </ul>
        )}

        {open && items.length === 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm text-gray-500">
            No se encontraron unidades
          </div>
        )}
      </div>
    );
  };

  // Mover este componente FUERA del export default para evitar remounts y pérdida de foco
  const AutocompleteEspecialidad: React.FC<{
    especialidades: any[];
    value?: string;
    onChange: (v: string) => void;
    onSelect: (s: any) => void;
  }> = ({ especialidades, value = "", onChange, onSelect }) => {
    const [query, setQuery] = React.useState<string>(value ?? "");
    const [open, setOpen] = React.useState<boolean>(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (value !== undefined && value !== query) setQuery(value ?? "");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    React.useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const items = React.useMemo(() => {
      const q = (query ?? "").trim().toLowerCase();
      if (!q) return (especialidades || []).slice();
      return (especialidades || []).filter((s: any) =>
        (s.nombre ?? "").toLowerCase().includes(q)
      );
    }, [especialidades, query]);

    const handleInput = (v: string) => {
      setQuery(v);
      onChange(v);
      setOpen(true);
    };

    const handleSelect = (s: any) => {
      const nombre = s.nombre ?? s.name ?? "";
      setQuery(nombre);
      onSelect(s);
      setOpen(false);
    };

    return (
      <div
        ref={containerRef}
        onClick={() => inputRef.current?.focus()}
        className="relative"
      >
        <input
          id="servicio"
          type="text"
          ref={inputRef}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          placeholder="Escribe para buscar / selecciona de la lista"
          autoComplete="off"
        />

        {open && items.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
            {items.map((s: any) => (
              <li
                key={s.id_especialidad ?? s.id}
                onMouseDown={(ev) => { ev.preventDefault(); handleSelect(s); }}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              >
                {s.nombre ?? s.name}
              </li>
            ))}
          </ul>
        )}

        {open && items.length === 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-sm text-gray-500">
            No se encontraron especialidades
          </div>
        )}
      </div>
    );
  };
type ReferenciaForm ={
  tipo_solicitud?: 'programada' | 'urgente';
  tipo_paciente?: 'trabajador' | 'beneficiario';
  no_expediente?: string;
  no_folio?: string;
  fecha_solicitud?: string;

  app_paterno?: string;
  app_materno?: string;
  nombre_paciente?: string;
  domicilio?: string;
  edad?: string;
  sexo?: 'mujer' | 'hombre';
  curp?: string;
  familiar_responsable?: string;
  telefono?: string;
  discapacidad?: string;

  // ENLACES A LA BD: usar ids (obtenidos desde selects / búsqueda)
  id_paciente?: number | null;
  id_medico_remitente?: number | null;
  id_unidad_origen?: number | null;
  id_unidad_destino?: number | null;
  id_especialidad_solicitada?: number | null;
  id_director_autoriza?: number | null;

  institucion?: string; // opcional, para mostrar
  unidad_medica?: string; // nombre visible si no tienes id aún
  servicio?: string;
  diagnostico_envio?: string;

  resumen_clinico?: string;
  peso?: string;
  talla?: string;
  fc?: string;
  fr?: string;
  temp?: string;
  ta?: string;
  spo2?: string;
  dextrostix?: string;

  procedimiento?: string;
  medico_solicitante?: string;
  directivo_autoriza?: string;

  // campos legacy
  patientName?: string;
  specialty?: string;
  reason?: string;
  prioridad?: 'Alta' | 'Media' | 'Baja';
  fecha_nacimiento?: string; // nuevo
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export default function NuevaReferencia(): JSX.Element {
  const navigate = useNavigate();
  //esto seiia el evento de seleccion del formulario
  const [form, setForm] = React.useState<ReferenciaForm>({ 
    tipo_solicitud: undefined,
    tipo_paciente: undefined,
    fecha_solicitud: new Date().toISOString().split("T")[0],
    sexo: undefined,
    prioridad: 'Media', // valor por defecto en español
  });

  // bloqueo para que el selector de sexo no cambie cuando el CURP/autocompletado lo determina
  const [sexLocked, setSexLocked] = React.useState<boolean>(false);

  const [especialidades, setEspecialidades] = React.useState<any[]>([]);
  const [unidades, setUnidades] = React.useState<any[]>([]);
  const [availableUnits, setAvailableUnits] = React.useState<number[] | null>(null); // null = no filtro

  const { user: currentUser } = useAuth() ?? {};

  // Autorrellenar 'institucion' desde currentUser -> medico -> unidad (reemplaza el efecto anterior)
  React.useEffect(() => {
    if (form.institucion) return;
    const token = localStorage.getItem('token');
    const userId = currentUser?.id_usuario ?? currentUser?.id ?? null;
    const medicoId = currentUser?.id_medico ?? currentUser?.medicoId ?? null;

    (async () => {
      try {
        // 1) si currentUser ya trae nombre de unidad, usarlo
        const candidate = currentUser?.unidad_nombre ?? currentUser?.unidad ?? currentUser?.institution ?? currentUser?.organizacion;
        if (candidate) {
          handleInputChange('institucion', candidate);
          return;
        }

        // 2) intentar obtener medico (por id_medico o por usuario)
        let medico = null;
        if (medicoId) {
          const r = await fetch(`${API_BASE}/medicos/${medicoId}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
          if (r.ok) medico = await r.json();
        } else if (userId) {
          const r = await fetch(`${API_BASE}/medicos/por_usuario/${userId}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
          if (r.ok) medico = await r.json();
        }

        // 3) si conseguimos medico, obtener unidad por id_unidad
        const unidadId = medico?.id_unidad ?? medico?.id_unidad_origen ?? null;
        if (unidadId) {
          // intentar endpoint específico de unidad
          const ru = await fetch(`${API_BASE}/unidades/${unidadId}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
          if (ru.ok) {
            const unidad = await ru.json();
            handleInputChange('institucion', unidad?.nombre ?? unidad?.name ?? '');
            return;
          }
          // fallback: usar lista ya cargada 'unidades'
          const found = unidades.find((u: any) => (u.id_unidad ?? u.id) === Number(unidadId));
          if (found) handleInputChange('institucion', found.nombre ?? found.name ?? '');
        }
      } catch (e) {
        // noop
      }
    })();
  }, [currentUser, unidades]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    fetch(`${API_BASE}/especialidades`)
      .then(r => r.ok ? r.json() : [])
      .then(setEspecialidades)
      .catch(() => setEspecialidades([]));
  }, []);

  React.useEffect(() => {
    fetch(`${API_BASE}/unidades`)
      .then(r => r.ok ? r.json() : [])
      .then(setUnidades)
      .catch(() => setUnidades([]));
  }, []);

  // Si 'institucion' queda autocompletada (desde user/medico), resolver y fijar id_unidad_origen automáticamente
  React.useEffect(() => {
    const nombre = (form.institucion ?? '').trim().toLowerCase();
    if (!nombre || form.id_unidad_origen) return;

    // Sólo autocompletar ORIGEN si la 'institucion' coincide con la unidad del usuario autenticado.
    // Si el usuario escribió manualmente la institución (p.ej. la usa para indicar la unidad destino),
    // NO se copiará al campo "Unidad médica que solicita".
    const userUnidad = (currentUser?.unidad_nombre ?? currentUser?.unidad ?? currentUser?.institution ?? '').toString().trim().toLowerCase();
    if (!userUnidad || userUnidad !== nombre) {
      console.log('[NuevaReferencia] institucion escrita manualmente o no coincide con unidad del usuario -> no autocompletar unidad origen');
      return;
    }

    const found = (unidades || []).find((u: any) => ((u.nombre ?? u.name) || '').toLowerCase() === nombre);
    if (found) {
      const id = found.id_unidad ?? found.id ?? null;
      handleInputChange('unidad_origen_nombre', found.nombre ?? found.name ?? '');
      handleInputChange('id_unidad_origen', id);
      console.log('[NuevaReferencia] autollenado id_unidad_origen desde institucion (effect):', id, found);
    }
  }, [form.institucion, unidades, currentUser]);
  
  // Lista de unidades a mostrar (filtrada por especialidad si availableUnits != null)
  const unidadesToShow = React.useMemo(() => {
    if (availableUnits === null) return unidades;
    return unidades.filter((u: any) => {
      const id = u.id_unidad ?? u.id;
      return id != null && availableUnits.includes(id);
    });
  }, [unidades, availableUnits]);
  
  const fetchUnitsForEspecialidad = async (especialidadId?: number | null) => {
    if (!especialidadId) { setAvailableUnits(null); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/unidad_especialidad/por_especialidad/${especialidadId}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) { setAvailableUnits([]); return; }
      const units = await res.json();
      setAvailableUnits(units.map((u:any) => u.id_unidad ?? u.id));
    } catch (err) {
      console.error('fetchUnitsForEspecialidad', err);
      setAvailableUnits([]);
    }
  };

  const handleInputChange = (key: keyof ReferenciaForm, value: any) => {
    // log para depuración: ver qué clave cambia y con qué valor
    console.log('[form] set', key, value);
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // helper para buscar unidad por nombre (case-insensitive)
const resolveUnidadIdByName = (name?: string) => {
  if (!name) return null;
  const n = name.toString().trim().toLowerCase();
  const found = (unidades || []).find((u: any) => ((u.nombre ?? u.name) || '').toLowerCase() === n);
  return found ? (found.id_unidad ?? found.id ?? null) : null;
};

// handlers específicos para origen / destino
const onSelectUnidadOrigen = (u: any) => {
  const id = u?.id_unidad ?? u?.id ?? null;
  handleInputChange('unidad_origen_nombre', u?.nombre ?? u?.name ?? '');
  handleInputChange('id_unidad_origen', id);
  console.log('[NuevaReferencia] onSelectUnidadOrigen ->', id, u);
};

const onSelectUnidadDestino = (u: any) => {
  const id = u?.id_unidad ?? u?.id ?? null;
  handleInputChange('unidad_destino_nombre', u?.nombre ?? u?.name ?? '');
  handleInputChange('id_unidad_destino', id);
  console.log('[NuevaReferencia] onSelectUnidadDestino ->', id, u);
};

// Evitar copiar institucion a unidad_origen cuando el usuario escribe.
// Sólo autocompletar id_unidad_origen desde 'institucion' si proviene del usuario autenticado.
React.useEffect(() => {
  const instit = (form.institucion ?? '').toString().trim().toLowerCase();
  if (!instit) return;
  // currentUser.unidad_nombre es el valor que tu app ya puede tener (ajusta si tu property es otra)
  const userUnidad = (currentUser?.unidad_nombre ?? currentUser?.unidad ?? '').toString().trim().toLowerCase();
  if (!userUnidad || userUnidad !== instit) {
    // institucion escrita manualmente -> NO copiarla a unidad_origen
    return;
  }
  // institucion coincide con la unidad del usuario -> autollenar id_unidad_origen
  const id = resolveUnidadIdByName(instit);
  if (id) {
    handleInputChange('unidad_origen_nombre', instit);
    handleInputChange('id_unidad_origen', id);
    console.log('[NuevaReferencia] autollenado id_unidad_origen desde institucion (effect):', id);
  }
}, [form.institucion, unidades, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // intentar resolver ids si faltan
    const idUnidadOrigen = form.id_unidad_origen ?? resolveUnidadIdByName(form.unidad_origen_nombre ?? form.institucion);
    const idUnidadDestino = form.id_unidad_destino ?? resolveUnidadIdByName(form.unidad_destino_nombre);

    console.log('[NuevaReferencia] final ids before submit -> origen:', idUnidadOrigen, 'destino:', idUnidadDestino);

    if (!idUnidadOrigen) { addToast({ title: 'Error', description: 'Selecciona la unidad solicitante.', color: 'warning' }); return; }
    if (!idUnidadDestino) { addToast({ title: 'Error', description: 'Selecciona la unidad destino.', color: 'warning' }); return; }
    if (Number(idUnidadOrigen) === Number(idUnidadDestino)) { addToast({ title: 'Error', description: 'Origen y destino no pueden ser la misma unidad.', color: 'warning' }); return; }

    const payload = {
      id_paciente: form.id_paciente ?? null,
      id_especialidad_solicitada: form.id_especialidad_solicitada ?? null,
      id_unidad_origen: idUnidadOrigen,
      id_unidad_destino: idUnidadDestino,
      id_medico_remitente: form.id_medico_remitente ?? null,
  
      // folio / expediente
      no_folio: form.no_folio ?? null,
      folio: form.no_folio ?? null,
      no_expediente: form.no_expediente ?? null,
  
      // metadatos de la solicitud
      tipo_solicitud: form.tipo_solicitud ?? null,
      tipo_paciente: form.tipo_paciente ?? null,
      prioridad: form.prioridad ?? "Media",
  
      // motivos / procedimiento / servicio
      motivo_envio: form.motivo_envio ?? form.diagnostico_envio ?? null,
      procedimiento: form.procedimiento ?? null,
      servicio: form.servicio ?? null,
      resumen_clinico: form.resumen_clinico ?? null,
  
      // signos vitales
      peso: form.peso ?? null,
      talla: form.talla ?? null,
      fc: form.fc ?? null,
      fr: form.fr ?? null,
      temp: form.temp ?? null,
      ta: form.ta ?? null,
      spo2: form.spo2 ?? null,
      dextrostix: form.dextrostix ?? null,
  
      // autorización / persona que autoriza
      medico_solicitante: form.medico_solicitante ?? null,
      directivo_autoriza: form.directivo_autoriza ?? null,
      id_director_autoriza: form.id_director_autoriza ?? null,
  
      // datos paciente visibles
      nombre_paciente: form.nombre_paciente ?? null,
      fecha_solicitud: form.fecha_solicitud ?? null,
      fecha_nacimiento: form.fecha_nacimiento ?? null,
    };
  
    console.log('Enviar createReferencia payload:', payload);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload)
    });
  
    const json = await res.json().catch(() => null);
    console.log('createReferencia response:', res.status, json);
    if (!res.ok) {
      addToast({ title: 'Error', description: json?.message ?? `HTTP ${res.status}`, color: 'danger' });
      return;
    }
  
    addToast({ title: 'Éxito', description: 'Referencia enviada', color: 'success' });
    // ...resto...
  };

  // timer para debounce de CURP
  const curpTimer = React.useRef<number | null>(null);

  const scheduleLookupCurp = (val?: string) => {
    const v = (val ?? form.curp ?? '').trim();
    if (curpTimer.current) {
      window.clearTimeout(curpTimer.current);
      curpTimer.current = null;
    }
    if (!v) {
      // si borraron CURP, desbloquear selección de sexo
      setSexLocked(false);
      return;
    }
    // si tienes CURP completa (18) ejecuta lookup inmediatamente
    if (v.length >= 18) {
      lookupCurp(v);
      return;
    }
    // si el usuario se detiene 700ms, ejecutar lookup (útil para autocompletar parcial)
    curpTimer.current = window.setTimeout(() => {
      lookupCurp(v);
      curpTimer.current = null;
    }, 700) as unknown as number;
  };

  React.useEffect(() => {
    return () => {
      if (curpTimer.current) window.clearTimeout(curpTimer.current);
    };
  }, []);

  // helper: formatea edad desde fecha YYYY-MM-DD en "X años Y meses", "Z meses W días" o "N días"
  const formatAgeFromDate = (fecha?: string | null) => {
    if (!fecha) return '';
    const dob = new Date(fecha);
    const now = new Date();
    if (isNaN(dob.getTime()) || dob > now) return '';

    let totalMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (now.getDate() < dob.getDate()) totalMonths -= 1;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    // calcular días residuales si es menor de un mes o para mostrar días adicionales
    let anchor = new Date(dob.getTime());
    anchor.setFullYear(dob.getFullYear() + years);
    anchor.setMonth(dob.getMonth() + months);
    let days = Math.floor((now.getTime() - anchor.getTime()) / (24 * 60 * 60 * 1000));
    if (days < 0) days = 0;

    if (years >= 1) {
      return `${years} año${years > 1 ? 's' : ''}${months ? ` ${months} mes${months > 1 ? 'es' : ''}` : ''}`;
    }
    if (months >= 1) {
      return `${months} mes${months > 1 ? 'es' : ''}${days ? ` ${days} día${days > 1 ? 's' : ''}` : ''}`;
    }
    return `${days} día${days !== 1 ? 's' : ''}`;
  };
  
  const lookupCurp = async (curpValue?: string) => {
    const curp = (curpValue ?? form.curp ?? '').trim();
    if (!curp) {
      setSexLocked(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/patients/curp/${encodeURIComponent(curp)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const json = await res.json().catch(() => null);
      console.log('[NuevaReferencia] lookupCurp response:', res.status, json);

      if (res.status === 404) {
        setSexLocked(false);
        addToast({ title: 'Paciente', description: 'No se encontró paciente con esa CURP', color: 'warning' });
        return;
      }
      if (!res.ok) {
        addToast({ title: 'Error', description: (json && json.message) || `HTTP ${res.status}`, color: 'danger' });
        return;
      }

      const p: any = json ?? {};
      // fallback nombres posibles: edad | age, fecha_nacimiento | fechaNacimiento, genero | sexo | gender
      // usamos formatAgeFromDate para un resultado detallado (años/meses/días)

      // log para depuración rápida
      console.log('[NuevaReferencia] patient payload:', p);

      handleInputChange('id_paciente', p.id_paciente ?? p.id ?? null);
      handleInputChange('nombre_paciente', p.nombre ?? p.name ?? '');
      handleInputChange('app_paterno', p.apellido_paterno ?? p.apellidoPaterno ?? '');
      handleInputChange('app_materno', p.apellido_materno ?? p.apellidoMaterno ?? '');
      handleInputChange('domicilio', p.domicilio ?? '');
      handleInputChange('telefono', p.telefono ?? p.phone ?? '');
      handleInputChange('curp', p.curp ?? curp);

      // fecha_nacimiento y edad formateada (mostrar meses/días si corresponde)
      const fechaNac = p.fecha_nacimiento ?? p.fechaNacimiento ?? null;
      handleInputChange('fecha_nacimiento', fechaNac ?? '');
      const edadFormatted = formatAgeFromDate(fechaNac) || (p.edad != null ? String(p.edad) : '');
      handleInputChange('edad', edadFormatted);

      // mapear genero robusto
      const rawGender = (p.genero ?? p.sexo ?? p.gender ?? '').toString();
      let mappedSexo: 'hombre' | 'mujer' | undefined;
      const s = rawGender.trim().toUpperCase();
      if (s === 'M' || s === 'H' || s === 'HOMBRE') mappedSexo = 'hombre';
      if (s === 'F' || s === 'Mujer'.toUpperCase() || s === 'MUJER') mappedSexo = 'mujer';
      if (mappedSexo) {
        handleInputChange('sexo', mappedSexo);
        setSexLocked(true);
      } else {
        setSexLocked(false);
      }

      handleInputChange('familiar_responsable', p.familiar_responsable ?? p.familiarResponsable ?? '');
      handleInputChange('discapacidad', p.discapacidad ?? '');

      addToast({ title: 'Paciente', description: 'Datos del paciente cargados', color: 'success' });
    } catch (err: any) {
      setSexLocked(false);
      console.error('lookupCurp error', err);
      addToast({ title: 'Error', description: err.message ?? 'No se pudo contactar al servidor', color: 'danger' });
    }
  };




  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header que querías antes de la sección 1 */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Hoja de Referencia Médica</h1>
        <hr className="mt-3 border-t-2 border-blue-200" />
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        {/* --- Sección 1: Información de la Solicitud --- */}
        <fieldset className="border border-gray-300 p-4 rounded-lg">
          <legend className="text-xl font-semibold text-gray-800 px-2">Información de la Solicitud</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Tipo de solicitud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de solicitud</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipo_solicitud"
                    value="programada"
                    checked={form.tipo_solicitud === "programada"}
                    onChange={() => handleInputChange("tipo_solicitud", "programada")}
                  />
                  <div className="radio-custom-dot" />
                  <span>Programada</span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipo_solicitud"
                    value="urgente"
                    checked={form.tipo_solicitud === "urgente"}
                    onChange={() => handleInputChange("tipo_solicitud", "urgente")}
                  />
                  <div className="radio-custom-dot" />
                  <span>URGENTE</span>
                </label>
              </div>
            </div>

            {/* Tipo de paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de paciente</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipo_paciente"
                    value="trabajador"
                    checked={form.tipo_paciente === "trabajador"}
                    onChange={() => handleInputChange("tipo_paciente", "trabajador")}
                  />
                  <div className="radio-custom-dot" />
                  <span>Trabajador</span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipo_paciente"
                    value="beneficiario"
                    checked={form.tipo_paciente === "beneficiario"}
                    onChange={() => handleInputChange("tipo_paciente", "beneficiario")}
                  />
                  <div className="radio-custom-dot" />
                  <span>Beneficiario</span>
                </label>
              </div>
            </div>

            {/* No. Expediente */}
            <div>
              <label htmlFor="no_expediente" className="block text-sm font-medium text-gray-700">No. Expediente</label>
              <input
                id="no_expediente"
                type="text"
                value={form.no_expediente ?? ""}
                onChange={(e) => handleInputChange("no_expediente", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* No. de solicitud y/o folio */}
            <div>
              <label htmlFor="no_folio" className="block text-sm font-medium text-gray-700">No. de solicitud y/o folio</label>
              <input
                id="no_folio"
                type="text"
                value={form.no_folio ?? ""}
                onChange={(e) => handleInputChange("no_folio", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Fecha de solicitud (fila completa) */}
            <div className="md:col-span-2">
              <label htmlFor="fecha_solicitud" className="block text-sm font-medium text-gray-700">Fecha de solicitud</label>
              <input
                id="fecha_solicitud"
                type="date"
                value={form.fecha_solicitud ?? ""}
                onChange={(e) => handleInputChange("fecha_solicitud", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>
        </fieldset>

        {/* Puedes añadir aquí más secciones o botones si los necesitas */}
        {/* --- Sección 2: Identificación del Paciente (REEMPLAZADO) --- */}
        <fieldset className="border border-gray-300 p-4 rounded-lg mt-6">
          <legend className="text-xl font-semibold text-gray-800 px-2">Identificación del Paciente</legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Apellido Paterno */}
            <div>
              <label htmlFor="app_paterno" className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
              <input
                id="app_paterno"
                type="text"
                value={form.app_paterno ?? ""}
                onChange={(e) => handleInputChange("app_paterno", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Apellido Materno */}
            <div>
              <label htmlFor="app_materno" className="block text-sm font-medium text-gray-700">Apellido Materno</label>
              <input
                id="app_materno"
                type="text"
                value={form.app_materno ?? ""}
                onChange={(e) => handleInputChange("app_materno", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Nombre(s) */}
            <div>
              <label htmlFor="nombre_paciente" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
              <input
                id="nombre_paciente"
                type="text"
                value={form.nombre_paciente ?? ""}
                onChange={(e) => handleInputChange("nombre_paciente", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Domicilio (full width) */}
            <div className="md:col-span-3">
              <label htmlFor="domicilio" className="block text-sm font-medium text-gray-700">Domicilio</label>
              <input
                id="domicilio"
                type="text"
                value={form.domicilio ?? ""}
                onChange={(e) => handleInputChange("domicilio", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <input
                id="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento ?? ""}
                onChange={(e) => {
                  handleInputChange('fecha_nacimiento', e.target.value);
                  // recalcular edad localmente y mostrar años/meses/días
                  if (e.target.value) {
                    handleInputChange('edad', formatAgeFromDate(e.target.value));
                  } else {
                    handleInputChange('edad', '');
                  }
                }}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Edad (solo lectura) */}
            <div>
              <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad</label>
              <input
                id="edad"
                type="text"
                value={form.edad ?? ""}
                readOnly
                className="mt-1 w-full p-2 border border-gray-200 rounded-md bg-gray-50"
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="sexo"
                    value="mujer"
                    checked={form.sexo === "mujer"}
                    onChange={() => handleInputChange("sexo", "mujer")}
                    disabled={sexLocked}
                  />
                  <div className="radio-custom-dot" />
                  <span>Mujer</span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="sexo"
                    value="hombre"
                    checked={form.sexo === "hombre"}
                    onChange={() => handleInputChange("sexo", "hombre")}
                    disabled={sexLocked}
                  />
                  <div className="radio-custom-dot" />
                  <span>Hombre</span>
                </label>
              </div>
            </div>

            {/* CURP */}
            <div>
              <label htmlFor="curp" className="block text-sm font-medium text-gray-700">C.U.R.P.</label>
              <input
                id="curp"
                type="text"
                maxLength={18}
                value={form.curp ?? ""}
                onChange={(e) => {
                  handleInputChange("curp", e.target.value);
                  scheduleLookupCurp(e.target.value);
                }}
                // quitar onBlur
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Familiar responsable */}
            <div className="md:col-span-2">
              <label htmlFor="familiar_responsable" className="block text-sm font-medium text-gray-700">Familiar responsable</label>
              <input
                id="familiar_responsable"
                type="text"
                value={form.familiar_responsable ?? ""}
                onChange={(e) => handleInputChange("familiar_responsable", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Número telefónico */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Número telefónico</label>
              <input
                id="telefono"
                type="tel"
                value={form.telefono ?? ""}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discapacidad (full width) */}
            <div className="md:col-span-3">
              <label htmlFor="discapacidad" className="block text-sm font-medium text-gray-700">Discapacidad (descripción)</label>
              <input
                id="discapacidad"
                type="text"
                placeholder="Ej. Motriz, visual, auditiva, etc."
                value={form.discapacidad ?? ""}
                onChange={(e) => handleInputChange("discapacidad", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </fieldset>
        {/* --- Sección: Información de la Unidad Solicitante (AÑADIR) --- */}
        <fieldset className="border border-gray-300 p-4 rounded-lg mt-6">
          <legend className="text-xl font-semibold text-gray-800 px-2">Información de la Unidad Solicitante</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Institución solicitante */}
            <div>
              <label htmlFor="institucion" className="block text-sm font-medium text-gray-700">Institución solicitante</label>
              <input
                id="institucion"
                type="text"
                value={form.institucion ?? ""}
                onChange={(e) => handleInputChange("institucion", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Unidad médica que solicita (TRATADA como UNIDAD DESTINO) */}
            <div>
              <label htmlFor="unidad_medica" className="block text-sm font-medium text-gray-700">Unidad médica que solicita</label>

              <AutocompleteUnidad
                unidades={unidadesToShow}
                value={form.unidad_destino_nombre ?? ""}
                onChange={(v) => {
                  // escribir en el campo visible de destino y limpiar id hasta selección
                  handleInputChange('unidad_destino_nombre', v);
                  handleInputChange('id_unidad_destino', null);
                }}
                onSelect={(u) => {
                  // cuando el usuario selecciona aquí, eso corresponde a la unidad DESTINO
                  const id = u?.id_unidad ?? u?.id ?? null;
                  handleInputChange('unidad_destino_nombre', u?.nombre ?? u?.name ?? '');
                  handleInputChange('id_unidad_destino', id);
                  console.log('[NuevaReferencia] onSelectUnidadDestino (desde campo "Unidad médica que solicita") ->', id, u);
                }}
              />

              <input
                type="hidden"
                onBlur={() => {
                  // fallback: resolver id_unidad_destino por nombre si el usuario escribió y salió del campo
                  if (form.id_unidad_destino) return;
                  const id = resolveUnidadIdByName(form.unidad_destino_nombre);
                  if (id) {
                    handleInputChange('id_unidad_destino', id);
                    console.log('[NuevaReferencia] resolved id_unidad_destino onBlur ->', id);
                  }
                }}
              />
            </div>

            {/* Prioridad */}
            <div>
             <label htmlFor="form-prioridad" className="block text-sm font-medium text-gray-700">Prioridad</label>
              <select
                id="form-prioridad"
                value={form.prioridad ?? "Media"}
                onChange={(e) => {
                  const v = e.target.value as "Alta" | "Media" | "Baja";
                  console.log('[form] prioridad onChange ->', v);
                  handleInputChange("prioridad", v);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            {/* Servicio que solicita */}
            <div className="md:col-span-2">
              <label htmlFor="servicio" className="block text-sm font-medium text-gray-700">Servicio que solicita</label>
              <AutocompleteEspecialidad
                especialidades={especialidades}
                value={form.servicio ?? ""}
                onChange={(v) => {
                  handleInputChange("servicio", v);
                  handleInputChange("id_especialidad_solicitada", null);
                }}
                onSelect={(s) => {
                  const id = s.id_especialidad ?? s.id;
                  handleInputChange("servicio", s.nombre ?? s.name);
                  handleInputChange("id_especialidad_solicitada", id ?? null);
                  fetchUnitsForEspecialidad(id ?? null);
                }}
              />
            </div>

            {/* Diagnóstico(s) de envío */}
            <div className="md:col-span-2">
              <label htmlFor="diagnostico_envio" className="block text-sm font-medium text-gray-700">Diagnóstico(s) de envío</label>
              <textarea
                id="diagnostico_envio"
                value={form.diagnostico_envio ?? ""}
                onChange={(e) => handleInputChange("diagnostico_envio", e.target.value)}
                rows={4}
                placeholder="(Catálogo de intervenciones)"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Motivo de envío */}
            <div className="md:col-span-2 mt-2">
              <label htmlFor="motivo_envio" className="block text-sm font-medium text-gray-700">Motivo de envío</label>
              <textarea
                id="motivo_envio"
                value={form.motivo_envio ?? ""}
                onChange={(e) => handleInputChange("motivo_envio", e.target.value)}
                rows={3}
                placeholder="Descripción del motivo de la referencia"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </fieldset>
                
        {/* --- Sección: Resumen Clínico y Signos Vitales (AÑADIR) --- */}
        <fieldset className="border border-gray-300 p-4 rounded-lg mt-6">
          <legend className="text-xl font-semibold text-gray-800 px-2">Resumen Clínico</legend>

          <div className="mt-4">
            <label htmlFor="resumen_clinico" className="block text-sm font-medium text-gray-700">Resumen Clínico</label>
            <textarea
              id="resumen_clinico"
              value={form.resumen_clinico ?? ""}
              onChange={(e) => handleInputChange("resumen_clinico", e.target.value)}
              placeholder="Principales datos del interrogatorio, exploración física, auxiliares de diagnóstico, tratamiento, terapéutica previa..."
              rows={6}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <h3 className="text-md font-semibold text-gray-700 mt-6 mb-3">Signos Vitales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div>
              <label htmlFor="peso" className="block text-xs font-medium text-gray-600">PESO (kg)</label>
              <input
                id="peso"
                type="number"
                step="0.1"
                value={form.peso ?? ""}
                onChange={(e) => handleInputChange("peso", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label htmlFor="talla" className="block text-xs font-medium text-gray-600">TALLA (cm)</label>
              <input
                id="talla"
                type="number"
                step="1"
                value={form.talla ?? ""}
                onChange={(e) => handleInputChange("talla", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="fc" className="block text-xs font-medium text-gray-600">FC (lpm)</label>
              <input
                id="fc"
                type="number"
                value={form.fc ?? ""}
                onChange={(e) => handleInputChange("fc", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="fr" className="block text-xs font-medium text-gray-600">FR (rpm)</label>
              <input
                id="fr"
                type="number"
                value={form.fr ?? ""}
                onChange={(e) => handleInputChange("fr", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="temp" className="block text-xs font-medium text-gray-600">TEMP (°C)</label>
              <input
                id="temp"
                type="number"
                step="0.1"
                value={form.temp ?? ""}
                onChange={(e) => handleInputChange("temp", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0"
              />
            </div>

            <div>
              <label htmlFor="ta" className="block text-xs font-medium text-gray-600">T/A (mmHg)</label>
              <input
                id="ta"
                type="text"
                value={form.ta ?? ""}
                onChange={(e) => handleInputChange("ta", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="120/80"
              />
            </div>

            <div>
              <label htmlFor="spo2" className="block text-xs font-medium text-gray-600">SPO2 (%)</label>
              <input
                id="spo2"
                type="number"
                value={form.spo2 ?? ""}
                onChange={(e) => handleInputChange("spo2", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="dextrostix" className="block text-xs font-medium text-gray-600">DEXTROSTIX</label>
              <input
                id="dextrostix"
                type="number"
                value={form.dextrostix ?? ""}
                onChange={(e) => handleInputChange("dextrostix", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </fieldset>
          

        {/* --- Sección: Procedimiento o Estudio Solicitado (AÑADIDO) --- */}
        <fieldset className="border border-gray-300 p-4 rounded-lg mt-6">
          <legend className="text-xl font-semibold text-gray-800 px-2">Procedimiento o Estudio Solicitado</legend>

          <div className="mt-4">
            <label htmlFor="procedimiento" className="block text-sm font-medium text-gray-700">Procedimiento o estudio solicitado</label>
            <textarea
              id="procedimiento"
              value={form.procedimiento ?? ""}
              onChange={(e) => handleInputChange("procedimiento", e.target.value)}
              rows={4}
              placeholder="(Catálogo de intervenciones u otros acordados en el convenio específico)"
              className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </fieldset>
                {/* --- Sección: Autorización --- */}
        <fieldset className="border border-gray-300 p-4 rounded-lg mt-6">
          <legend className="text-xl font-semibold text-gray-800 px-2">Autorización</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="medico_solicitante" className="block text-sm font-medium text-gray-700">Nombre y clave del médico solicitante</label>
              <input
                id="medico_solicitante"
                type="text"
                value={form.medico_solicitante ?? ""}
                onChange={(e) => handleInputChange("medico_solicitante", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="directivo_autoriza" className="block text-sm font-medium text-gray-700">Nombre y clave del directivo que autoriza</label>
              <input
                id="directivo_autoriza"
                type="text"
                value={form.directivo_autoriza ?? ""}
                onChange={(e) => handleInputChange("directivo_autoriza", e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Botones: Salir y Guardar */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/doctor/referrals")}
            className="px-5 py-3 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Salir
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
          >
            Guardar y Enviar Referencia
          </button>
        </div>
      </form>
    </div>
  );
}