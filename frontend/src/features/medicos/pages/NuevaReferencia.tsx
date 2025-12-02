import React from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useAuth } from '../../../context/auth-context';
import ReferralForm from '../components/ReferralForm';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';

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
  // id de la unidad donde está asignado el médico autenticado (para excluirla del listado destino)
  const [assignedUnidadId, setAssignedUnidadId] = React.useState<number | null>(null);
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
        // guardar id de la unidad asignada al medico para excluirla del selector de destino
        if (unidadId) setAssignedUnidadId(Number(unidadId));
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
    const base = (unidades || []).slice();
    // aplicar filtro por especialidad si corresponde
    const byEspecialidad = availableUnits === null
      ? base
      : base.filter((u: any) => {
          const id = u.id_unidad ?? u.id;
          return id != null && availableUnits.includes(id);
        });
    // excluir la unidad asignada al médico autenticado y la unidad origen (si se definió)
    const origenId = form.id_unidad_origen ?? form.id_unidad_solicitante ?? null;
    return byEspecialidad.filter((u: any) => {
      const id = Number(u.id_unidad ?? u.id ?? -1);
      if (assignedUnidadId && id === Number(assignedUnidadId)) return false;
      if (origenId && id === Number(origenId)) return false;
      return true;
    });
  }, [unidades, availableUnits, form.id_unidad_origen, assignedUnidadId]);
  
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
      // PRIORIDAD: usar el textarea de diagnóstico como 'procedimiento'
      procedimiento: form.diagnostico_envio ?? form.procedimiento ?? form.servicio ?? null,
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

    console.log('Enviar createReferencia payload (antes de normalizar):', payload);
    // DEBUG: revisar valores relevantes
    console.log('[DEBUG] form.diagnostico_envio ->', form.diagnostico_envio, 'form.procedimiento ->', form.procedimiento, 'form.servicio ->', form.servicio);
    // usar el helper centralizado que normaliza el token y maneja 401/expirado
    const res = await fetchWithAuth(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  // Ejecutar lookup (debounced) cuando cambie el campo curp del formulario
  React.useEffect(() => {
    scheduleLookupCurp(form.curp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.curp]);
  
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
    <ReferralForm
      formData={form}
      onChange={(k,v) => handleInputChange(k as any, v)}
      onSubmit={handleSubmit}
      unidades={unidadesToShow}                    // usar lista filtrada (excluye según especialidad)
      especialidades={especialidades}
      readOnly={false}
      onSelectUnidadOrigen={onSelectUnidadOrigen}  // pasar handlers para setear ids/nombres
      onSelectUnidadDestino={onSelectUnidadDestino}
    />
  );
}