import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useAuth } from '../../../context/auth-context';
import ReferralForm from '../components/ReferralForm';

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
  const location = useLocation();
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
        }

        // 2) intentar obtener medico (por id_medico o por usuario)
        let medico = null;
        if (medicoId) {
          try {
            const res = await fetch(`${API_BASE}/medicos/${medicoId}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            if (res.ok) medico = await res.json();
          } catch (e) { /* noop */ }
        }
        if (!medico && userId) {
          try {
            const res = await fetch(`${API_BASE}/medicos/por_usuario/${userId}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            if (res.ok) medico = await res.json();
          } catch (e) { /* noop */ }
        }

        // 3) si conseguimos medico, obtener unidad por id_unidad y autocompletar nombre del medico
        if (medico) {
          const fullName = [medico.nombre, medico.apellido_paterno, medico.apellido_materno].filter(Boolean).join(' ').trim();
          if (fullName) handleInputChange('medico_solicitante', fullName);
          const idMed = medico.id_medico ?? medico.id ?? null;
          if (idMed) handleInputChange('id_medico_remitente', idMed);

          // fijar unidad asignada (usada para excluir en destinos)
          const unidadId = medico.id_unidad ?? medico.idUnidad ?? null;
          if (unidadId) {
            setAssignedUnidadId(Number(unidadId));
            // también intentar resolver y fijar institucion/unidad origen si coincide con listas ya cargadas
            const found = (unidades || []).find((u: any) => Number(u.id_unidad ?? u.id ?? -1) === Number(unidadId));
            if (found) {
              handleInputChange('institucion', found.nombre ?? found.name ?? '');
              // Si el usuario no escribió y la institucion coincide con su unidad, fijar id_unidad_origen
              if (!form.id_unidad_origen) {
                handleInputChange('unidad_origen_nombre', found.nombre ?? found.name ?? '');
                handleInputChange('id_unidad_origen', found.id_unidad ?? found.id ?? null);
              }
            }
          }

          // intentar obtener director de la unidad del medico para autocompletar directivo_autoriza
          const unidadForDirector = medico.id_unidad ?? medico.idUnidad ?? null;
          if (unidadForDirector) {
            try {
              const r = await fetch(`${API_BASE}/directors/por_unidad/${unidadForDirector}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
              if (r.ok) {
                const d = await r.json();
                const nombreDir = [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' ').trim();
                if (nombreDir) {
                  handleInputChange('directivo_autoriza', nombreDir);
                  handleInputChange('id_director_autoriza', d.id_director ?? d.id ?? null);
                }
              }
            } catch (err) {
              console.debug('Autofill director error', err);
            }
          }
        }
      } catch (e) {
        console.error('Autorellenar institucion/medico error', e);
      }
    })();
  }, [currentUser, unidades]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/especialidades`);
        const json = await res.json().catch(() => null);
        console.log('[NuevaReferencia] fetch especialidades ->', res.status, Array.isArray(json) ? `count=${json.length}` : json);
        setEspecialidades(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error('[NuevaReferencia] fetch especialidades error', err);
        setEspecialidades([]);
      }
    })();
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

  // handler para selección de especialidad desde el Autocomplete
  const handleSelectEspecialidad = (s: any) => {
    if (!s) return;
    const id = s.id_especialidad ?? s.id ?? null;
    const nombre = s.nombre ?? s.name ?? '';
    // actualizar form mediante el handler que ya usas para mantener efectos/autorellenado
    handleInputChange('id_especialidad_solicitada', id);
    handleInputChange('servicio', nombre);
    // si tienes lógica para cargar unidades por especialidad, puedes llamarla aquí:
    // fetchUnitsForEspecialidad?.(Number(id));
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

    // detectar modo edición si venimos desde ReferenciasEmitidas (location.state.edit + referral)
    const st = (location && (location as any).state) || null;
    const incoming = st?.referral ?? null;
    const editId =
      incoming?.id_referencia ??
      incoming?.id ??
      incoming?.rawId ?? // caso en que mapReferral pasó rawId
      ((incoming && incoming._raw && (incoming._raw.id_referencia ?? incoming._raw.id)) || null);

    // intentar resolver ids si faltan (misma lógica usada para creación)
    const idUnidadOrigen = form.id_unidad_origen ?? resolveUnidadIdByName(form.unidad_origen_nombre ?? form.institucion);
    const idUnidadDestino = form.id_unidad_destino ?? resolveUnidadIdByName(form.unidad_destino_nombre);

    if (!idUnidadOrigen) { addToast({ title: 'Error', description: 'Selecciona la unidad solicitante.', color: 'warning' }); return; }
    if (!idUnidadDestino) { addToast({ title: 'Error', description: 'Selecciona la unidad destino.', color: 'warning' }); return; }
    if (Number(idUnidadOrigen) === Number(idUnidadDestino)) { addToast({ title: 'Error', description: 'Origen y destino no pueden ser la misma unidad.', color: 'warning' }); return; }

    const token = localStorage.getItem('token');

    // Si estamos en modo edición y hay un id válido -> PATCH al endpoint de update (no altera la creación)
    if (st?.edit && editId) {
      try {
        // construir payload de actualización (puede enviarse solo campos editables)
        const updatePayload: any = {
          id_paciente: form.id_paciente ?? null,
          id_especialidad_solicitada: form.id_especialidad_solicitada ?? null,
          id_unidad_origen: idUnidadOrigen,
          id_unidad_destino: idUnidadDestino,
          id_medico_remitente: form.id_medico_remitente ?? null,

          no_folio: form.no_folio ?? null,
          no_expediente: form.no_expediente ?? null,

          tipo_solicitud: form.tipo_solicitud ?? null,
          tipo_paciente: form.tipo_paciente ?? null,
          prioridad: form.prioridad ?? "Media",

          motivo_envio: form.motivo_envio ?? form.diagnostico_envio ?? null,
          // <-- enviar procedimiento tomando el valor de form.procedimiento o, si está vacío, el texto de diagnostico_envio
          procedimiento: form.procedimiento ?? form.diagnostico_envio ?? null,
          // incluir también diagnostico_envio por compatibilidad con el backend
          diagnostico_envio: form.diagnostico_envio ?? null,
          servicio: form.servicio ?? null,
          resumen_clinico: form.resumen_clinico ?? null,

          peso: form.peso ?? null,
          talla: form.talla ?? null,
          fc: form.fc ?? null,
          fr: form.fr ?? null,
          temp: form.temp ?? null,
          ta: form.ta ?? null,
          spo2: form.spo2 ?? null,
          dextrostix: form.dextrostix ?? null,

          medico_solicitante: form.medico_solicitante ?? null,
          directivo_autoriza: form.directivo_autoriza ?? null,
          id_director_autoriza: form.id_director_autoriza ?? null,

          nombre_paciente: form.nombre_paciente ?? null,
          fecha_solicitud: form.fecha_solicitud ?? null,
          fecha_nacimiento: form.fecha_nacimiento ?? null
        };

        console.log('[NuevaReferencia] updatePayload ->', editId, updatePayload);

        const res = await fetch(`${API_BASE}/referrals/${encodeURIComponent(editId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(updatePayload)
        });

        const json = await res.json().catch(() => null);
        console.log('updateReferencia response:', res.status, json);

        if (!res.ok) {
          addToast({ title: 'Error', description: json?.message ?? `HTTP ${res.status}`, color: 'danger' });
          return;
        }

        addToast({ title: 'Éxito', description: 'Referencia actualizada', color: 'success' });
        // después de guardar en modo edición, redirigir o cerrar según UX (ejemplo: volver a lista)
        navigate('/doctor/referrals');
        return;
      } catch (err) {
        console.error('updateReferencia error', err);
        addToast({ title: 'Error', description: 'No se pudo actualizar la referencia', color: 'danger' });
        return;
      }
    }

    // --- CREACIÓN: mantener exactamente la lógica existente para crear nueva referencia ---
    const payload = {
      id_paciente: form.id_paciente ?? null,
      id_especialidad_solicitada: form.id_especialidad_solicitada ?? null,
      id_unidad_origen: idUnidadOrigen,
      id_unidad_destino: idUnidadDestino,
      id_medico_remitente: form.id_medico_remitente ?? null,

      no_folio: form.no_folio ?? null,
      folio: form.no_folio ?? null,
      no_expediente: form.no_expediente ?? null,

      tipo_solicitud: form.tipo_solicitud ?? null,
      tipo_paciente: form.tipo_paciente ?? null,
      prioridad: form.prioridad ?? "Media",

      motivo_envio: form.motivo_envio ?? form.diagnostico_envio ?? null,
      procedimiento: form.procedimiento ?? null,
      servicio: form.servicio ?? null,
      resumen_clinico: form.resumen_clinico ?? null,

      peso: form.peso ?? null,
      talla: form.talla ?? null,
      fc: form.fc ?? null,
      fr: form.fr ?? null,
      temp: form.temp ?? null,
      ta: form.ta ?? null,
      spo2: form.spo2 ?? null,
      dextrostix: form.dextrostix ?? null,

      medico_solicitante: form.medico_solicitante ?? null,
      directivo_autoriza: form.directivo_autoriza ?? null,
      id_director_autoriza: form.id_director_autoriza ?? null,

      nombre_paciente: form.nombre_paciente ?? null,
      fecha_solicitud: form.fecha_solicitud ?? null,
      fecha_nacimiento: form.fecha_nacimiento ?? null
    };

    console.log('Enviar createReferencia payload:', payload);
    try {
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
      navigate('/doctor/referrals');
    } catch (err) {
      console.error('createReferencia error', err);
      addToast({ title: 'Error', description: 'No se pudo crear la referencia', color: 'danger' });
    }
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




  React.useEffect(() => {
    try {
      const st = (location && (location.state as any)) || null;
      if (!st || !st.edit) return;
      const r = st.referral ?? st;

      const pick = (names: string[] | string, fallback = null) => {
        const keys = Array.isArray(names) ? names : [names];
        for (const k of keys) {
          if (typeof r === 'object' && r != null && (k in r) && r[k] !== undefined) return r[k];
        }
        return fallback;
      };

      const pickNested = (paths: string[][], fallback = null) => {
        for (const path of paths) {
          let cur: any = r;
          let ok = true;
          for (const p of path) {
            if (!cur || !(p in cur)) { ok = false; break; }
            cur = cur[p];
          }
          if (ok && cur !== undefined) return cur;
        }
        return fallback;
      };

      const normalizeSexo = (raw: any) => {
        if (!raw && raw !== 0) return undefined;
        const s = String(raw).trim().toLowerCase();
        if (!s) return undefined;
        if (s === 'm' || s === 'masculino' || s === 'male' || s === 'hombre') return 'hombre';
        if (s === 'f' || s === 'femenino' || s === 'female' || s === 'mujer') return 'mujer';
        return undefined;
      };

      const mapped: any = {
        // ids / meta
        no_expediente: pick(['no_expediente', 'noExpediente', 'expediente', 'expediente_num', 'expediente_numero', 'record_number', 'expedienteId', 'expediente_id'], ''),
        no_folio: pick(['folio', 'no_folio', 'noFolio'], ''),
        fecha_solicitud: pick(['fecha_solicitud', 'fechaSolicitud', 'created_at', 'fecha'], '')?.toString() ?? '',

        // solicitud: mapear tipo_solicitud y tipo_paciente (aliases soportados)
        tipo_solicitud: pick(['tipo_solicitud', 'tipoSolicitud', 'tipo', 'request_type'], ''),
        tipo_paciente: pick(['tipo_paciente', 'tipoPaciente', 'paciente_tipo', 'patient_type'], ''),

        // paciente (soporta varias estructuras: directo en objeto o dentro de paciente/paciente_ref)
        id_paciente: pickNested([['id_paciente'], ['paciente','id_paciente'], ['paciente','id'], ['patient','id']], null),
        nombre_paciente: pickNested([['nombre_paciente'], ['paciente','nombre'], ['patient','name'], ['paciente_ref','nombre']], ''),
        app_paterno: pickNested([['app_paterno'], ['paciente','apellido_paterno'], ['paciente_ref','apellido_paterno']], ''),
        app_materno: pickNested([['app_materno'], ['paciente','apellido_materno'], ['paciente_ref','apellido_materno']], ''),

        // campos que faltaban: domicilio, fecha_nacimiento, edad, curp, sexo, familiar_responsable, telefono
        domicilio: pickNested([['paciente','domicilio'], ['paciente_ref','domicilio'], ['domicilio'], ['patient','address'], ['paciente_ref','domicilio']], ''),
        fecha_nacimiento: pickNested([['paciente','fecha_nacimiento'], ['paciente_ref','fecha_nacimiento'], ['paciente','fechaNacimiento'], ['paciente_ref','fechaNacimiento'], ['fecha_nacimiento'], ['fechaNacimiento'], ['patient','birth_date']], '') ?? '',
        edad: pickNested([['paciente','edad'], ['paciente_ref','edad'], ['edad'], ['patient','age']], '') ?? '',
        curp: pickNested([['paciente','curp'], ['paciente_ref','curp'], ['curp'], ['patient','curp']], '') ?? '',
        sexo: normalizeSexo(
          pickNested([['paciente','genero'], ['paciente_ref','genero'], ['paciente','sexo'], ['paciente_ref','sexo'], ['sexo'], ['genero'], ['patient','gender']], '') ?? pick(['sexo','genero'], '')
        ) ?? undefined,
        familiar_responsable: pickNested([['paciente','familiar_responsable'], ['paciente_ref','familiar_responsable'], ['familiar_responsable'], ['patient','guardian']], '') ?? '',
        telefono: pickNested([['paciente','telefono'], ['paciente_ref','telefono'], ['telefono'], ['patient','phone']], '') ?? '',

        // unidades / servicio
        id_unidad_origen: pick(['id_unidad_origen','id_unidad_solicitante','unidad_origen_id'], null),
        unidad_origen_nombre: pickNested([['unidad_origen','nombre'], ['unidad_origen_nombre'], ['institucion']], ''),
        id_unidad_destino: pick(['id_unidad_destino','unidad_destino_id'], null),
        unidad_destino_nombre: pickNested([['unidad_destino','nombre'], ['unidad_destino_nombre']], ''),

        // especialidad / servicio
        id_especialidad_solicitada: pick(['id_especialidad_solicitada','id_especialidad','especialidad_id'], null),
        servicio: pickNested([['especialidad_ref','nombre'], ['especialidad','nombre'], ['servicio']], ''),

        // motivos / resumen
        motivo_envio: pick(['motivo_envio','motivo','reason'], ''),
        // mapear campo diagnóstico/procedimiento (variantes comunes)
        diagnostico_envio: pick(['diagnostico_envio','procedimiento','procedure','procedimiento_envio','procedimientoEnvio'], '') ?? '',
        resumen_clinico: pick(['resumen_clinico','resumen','diagnostico_envio'], ''),

        // signos vitales (si existen)
        peso: pick('peso',''),
        talla: pick('talla',''),
        fc: pick('fc',''),
        fr: pick('fr',''),
        temp: pick('temp',''),
        ta: pick('ta',''),
        spo2: pick('spo2',''),
        dextrostix: pick('dextrostix',''),

        // medico / autorizacion
        id_medico_remitente: pickNested([['id_medico_remitente'], ['medico_remitente','id_medico'], ['medico','id']], null),
        medico_solicitante: ((): string => {
          const m = pickNested([['medico_remitente'], ['medico'], ['medico_ref']], null) || pick(['medico_solicitante','medico'], '');
          if (!m) return '';
          if (typeof m === 'string') return m;
          return [m.nombre, m.apellido_paterno, m.apellido_materno].filter(Boolean).join(' ').trim();
        })(),

        id_director_autoriza: pick(['id_director_autoriza','id_director','director_id'], null),
        directivo_autoriza: ((): string => {
          const d = pickNested([['director_autoriza'], ['director'], ['directivo']], null) || pick('directivo_autoriza','');
          if (!d) return '';
          if (typeof d === 'string') return d;
          return [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' ').trim();
        })(),

        prioridad: pick(['prioridad','priority'], 'Media')
      };

      console.log('[NuevaReferencia] cargando referencia para edición, mapped:', mapped);

      // setear form sin sobrescribir campos manuales no mapeados
      setForm(prev => ({ ...prev, ...mapped }));

      // si la referencia incluye medico con unidad, fijar assignedUnidadId (ayuda a filtrar destinos)
      const medUnidad = pickNested([['medico_remitente','id_unidad'], ['medico','id_unidad'], ['medico','idUnidad']], null);
      if (medUnidad) setAssignedUnidadId(Number(medUnidad));

      // resolver nombres de unidades si sólo vienen ids y ya cargaste unidades
      const tryResolve = (id: any) => {
        if (!id) return null;
        const found = (unidades || []).find((u: any) => Number(u.id_unidad ?? u.id ?? -1) === Number(id));
        return found ? (found.nombre ?? found.name ?? '') : null;
      };
      if (mapped.id_unidad_origen && !mapped.unidad_origen_nombre) {
        const n = tryResolve(mapped.id_unidad_origen);
        if (n) handleInputChange('unidad_origen_nombre', n);
      }
      if (mapped.id_unidad_destino && !mapped.unidad_destino_nombre) {
        const n = tryResolve(mapped.id_unidad_destino);
        if (n) handleInputChange('unidad_destino_nombre', n);
      }
    } catch (err) {
      console.error('Error cargando referencia para edición', err);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [location, unidades]);

  // --- RENDER ---
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