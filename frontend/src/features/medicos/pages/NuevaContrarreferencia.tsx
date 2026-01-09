import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addToast } from "@heroui/react";
import { useAuth } from '../../../context/auth-context';

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
  const location = useLocation();
  const [form, setForm] = React.useState<ContrarreferenciaForm>({
    sexo: undefined,
    fecha_ingreso: "",
    fecha_egreso: "",
  });
  const { user: currentUser } = useAuth() ?? {}; // <-- agregar

  const handleChange = (k: keyof ContrarreferenciaForm, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  // --- BEGIN: CURP lookup (auto relleno) ---
  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
  const curpTimer = React.useRef<number | null>(null);

  const scheduleLookupCurp = (val?: string) => {
    const v = (val ?? form.curp ?? '').trim();
    if (curpTimer.current) {
      window.clearTimeout(curpTimer.current);
      curpTimer.current = null;
    }
    if (!v) return;
    if (v.length >= 18) {
      lookupCurp(v);
      return;
    }
    curpTimer.current = window.setTimeout(() => {
      lookupCurp(v);
      curpTimer.current = null;
    }, 700) as unknown as number;
  };

  const formatAgeFromDate = (fecha?: string | null) => {
    if (!fecha) return '';
    const dob = new Date(fecha);
    const now = new Date();
    if (isNaN(dob.getTime()) || dob > now) return '';
    let totalMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (now.getDate() < dob.getDate()) totalMonths -= 1;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years >= 1) return `${years} año${years>1?'s':''}${months?` ${months} mes${months>1?'es':''}`:''}`;
    if (months >= 1) {
      const anchor = new Date(dob.getTime());
      anchor.setFullYear(dob.getFullYear());
      anchor.setMonth(dob.getMonth() + months);
      let days = Math.floor((now.getTime() - anchor.getTime()) / (24*60*60*1000));
      if (days < 0) days = 0;
      return `${months} mes${months>1?'es':''}${days?` ${days} día${days>1?'s':''}`:''}`;
    }
    const days = Math.floor((now.getTime() - dob.getTime()) / (24*60*60*1000));
    return `${days} día${days!==1?'s':''}`;
  };

  const lookupCurp = async (curpValue?: string) => {
    const curp = (curpValue ?? form.curp ?? '').trim();
    if (!curp) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/patients/curp/${encodeURIComponent(curp)}`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const json = await res.json().catch(()=>null);
      console.log('[NuevaContrarreferencia] lookupCurp response:', res.status, json);
      if (res.status === 404) {
        addToast({ title: 'Paciente', description: 'No se encontró paciente con esa CURP', color: 'warning' });
        return;
      }
      if (!res.ok) {
        addToast({ title: 'Error', description: json?.message ?? `HTTP ${res.status}`, color: 'danger' });
        return;
      }
      const p: any = json ?? {};
      // setear campos compatibles con el formulario de contrarreferencia
      handleChange('curp', p.curp ?? curp);
      handleChange('id_paciente' as any, p.id_paciente ?? p.id ?? undefined); // opcional, por compatibilidad
      handleChange('nombre_paciente', p.nombre ?? p.name ?? '');
      handleChange('app_paterno', p.apellido_paterno ?? p.apellidoPaterno ?? '');
      handleChange('app_materno', p.apellido_materno ?? p.apellidoMaterno ?? '');
      handleChange('domicilio', p.domicilio ?? '');
      handleChange('telefono', p.telefono ?? p.phone ?? '');

      // intentar múltiples aliases para fecha de nacimiento / dob
      const fechaCandidates = [
        p.fecha_nacimiento, p.fechaNacimiento, p.fecha_nac,
        p.nacimiento, p.nacimiento_fecha, p.dob, p.fechaNacimientoPaciente
      ];
      let fechaNac: string | null = null;
      for (const c of fechaCandidates) {
        if (c) {
          fechaNac = String(c);
          break;
        }
      }
      // preservar fechas de ingreso/egreso del formulario
      handleChange('fecha_ingreso' as any, form.fecha_ingreso);
      handleChange('fecha_egreso' as any, form.fecha_egreso);

      // calcular edad: preferir cálculo desde fecha de nacimiento; fallback a p.edad
      let computedAge = '';
      if (fechaNac) computedAge = formatAgeFromDate(fechaNac) || '';
      if (!computedAge && (p.edad != null)) computedAge = String(p.edad);
      // si hay edad en meses explícita
      if (!computedAge && (p.edad_meses != null)) computedAge = `${p.edad_meses} mes${Number(p.edad_meses) === 1 ? '' : 'es'}`;

      // PARA EL INPUT type="number" guardamos un valor numérico (años) para evitar el error de parsing
      let numericAgeValue: number | '' = '';
      if (p.edad != null && !isNaN(Number(p.edad))) {
        numericAgeValue = Number(p.edad);
      } else if (fechaNac) {
        // calcular años completos desde fechaNac
        try {
          const dob = new Date(fechaNac);
          const now = new Date();
          let years = now.getFullYear() - dob.getFullYear();
          const m = now.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
          numericAgeValue = Number.isFinite(years) && years >= 0 ? years : 0;
        } catch (e) {
          numericAgeValue = '';
        }
      }

      // seteamos la edad numérica para el input y además la edad formateada en otro campo para mostrar texto
      handleChange('edad', numericAgeValue);
      handleChange('edad_formateada' as any, computedAge || '');

      const rawGender = (p.genero ?? p.sexo ?? p.gender ?? '').toString().trim().toLowerCase();
      if (rawGender) {
        if (rawGender === 'm' || rawGender === 'hombre' || rawGender === 'masculino' || rawGender === 'male') handleChange('sexo', 'hombre');
        else if (rawGender === 'f' || rawGender === 'mujer' || rawGender === 'femenino' || rawGender === 'female') handleChange('sexo', 'mujer');
      }
      handleChange('familiar_responsable' as any, p.familiar_responsable ?? p.familiarResponsable ?? ''); // optional
      addToast({ title: 'Paciente', description: 'Datos del paciente cargados', color: 'success' });
    } catch (err: any) {
      console.error('lookupCurp error', err);
      addToast({ title: 'Error', description: err?.message ?? 'No se pudo contactar al servidor', color: 'danger' });
    }
  };

  React.useEffect(() => {
    scheduleLookupCurp(form.curp);
    return () => {
      if (curpTimer.current) window.clearTimeout(curpTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.curp]);
  // --- END: CURP lookup (auto relleno) ---

  // Autocomplete de institución que recibió: usar unidad del médico/usuario autenticado
  React.useEffect(() => {
    if (form.institucion_recibio) return; // no sobrescribir si ya hay valor
    const candidate = currentUser?.unidad_nombre ?? currentUser?.unidad ?? currentUser?.institution ?? null;
    if (candidate) {
      handleChange('institucion_recibio', candidate);
      return;
    }

    const medicoId = currentUser?.id_medico ?? currentUser?.medicoId ?? null;
    const userId = currentUser?.id_usuario ?? currentUser?.id ?? null;

    (async () => {
      try {
        const token = localStorage.getItem('token');
        let medico = null;
        if (medicoId) {
          try {
            const r = await fetch(`${API_BASE}/medicos/${medicoId}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            if (r.ok) medico = await r.json();
          } catch (e) { /* noop */ }
        }
        if (!medico && userId) {
          try {
            const r = await fetch(`${API_BASE}/medicos/por_usuario/${userId}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
            if (r.ok) medico = await r.json();
          } catch (e) { /* noop */ }
        }

        if (medico) {
          const inst = medico.unidad_nombre ?? medico.unidad ?? medico.institucion ?? null;
          if (inst) {
            handleChange('institucion_recibio', inst);
            return;
          }
          const unidadId = medico.id_unidad ?? medico.idUnidad ?? null;
          if (unidadId) {
            try {
              const r = await fetch(`${API_BASE}/unidades/${unidadId}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
              if (r.ok) {
                const u = await r.json();
                handleChange('institucion_recibio', u.nombre ?? u.name ?? '');
              }
            } catch (e) { /* noop */ }
          }
        }
      } catch (err) {
        console.debug('Autofill institucion_recibio error', err);
      }
    })();
  }, [currentUser, form.institucion_recibio]);

  // listar unidades para el select "Unidad médica que solicitó (origen)"
  const [unidadesList, setUnidadesList] = React.useState<any[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`${API_BASE}/unidades`, {
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const j = await r.json().catch(() => null);
        const list = Array.isArray(j) ? j : (j?.rows ?? j?.data ?? []);
        setUnidadesList(Array.isArray(list) ? list : []);
      } catch (err) {
        setUnidadesList([]);
      }
    })();
  }, []);
  
  // listar especialidades para el select "Servicio que recibió (en esta unidad)"
  const [especialidadesList, setEspecialidadesList] = React.useState<any[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`${API_BASE}/especialidades`, {
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const j = await r.json().catch(() => null);
        const list = Array.isArray(j) ? j : (j?.rows ?? j?.data ?? []);
        setEspecialidadesList(Array.isArray(list) ? list : []);
      } catch (err) {
        setEspecialidadesList([]);
      }
    })();
  }, []);

  // autofill: Nombre, clave y firma del médico tratante (igual que en NuevaReferencia)
  React.useEffect(() => {
    if (form.medico_tratante) return; // no sobrescribir si ya hay valor

    // intentar usar valor ya presente en el usuario autenticado
    const candidateFromUser =
      currentUser?.medico_tratante ??
      currentUser?.medico_nombre ??
      currentUser?.medico_solicitante ??
      currentUser?.nombre ??
      currentUser?.name ??
      null;

    if (candidateFromUser) {
      handleChange('medico_tratante', candidateFromUser);
      return;
    }

    const medicoId = currentUser?.id_medico ?? currentUser?.medicoId ?? null;
    const userId = currentUser?.id_usuario ?? currentUser?.id ?? null;

    (async () => {
      try {
        const token = localStorage.getItem('token');
        let medico: any = null;

        if (medicoId) {
          const r = await fetch(`${API_BASE}/medicos/${medicoId}`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          if (r.ok) medico = await r.json();
        }

        if (!medico && userId) {
          const r = await fetch(`${API_BASE}/medicos/por_usuario/${userId}`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          if (r.ok) medico = await r.json();
        }

        if (!medico) return;

        const fullname = [medico.nombre, medico.apellido_paterno, medico.apellido_materno].filter(Boolean).join(' ').trim();
        if (fullname) handleChange('medico_tratante', fullname);
      } catch (e) {
        console.debug('Autofill medico_tratante error', e);
      }
    })();
  }, [currentUser, form.medico_tratante]);

  // autofill: Nombre, clave y firma del Director de la Unidad (replicando lógica de NuevaReferencia)
  React.useEffect(() => {
    if (form.director_unidad) return;
    // helper local para construir nombre completo desde varios shapes posibles
    const buildFullName = (o: any) => {
      if (!o) return null;
      if (typeof o === 'string') return o;
      const first = o.nombre ?? o.name ?? o.nombre_director ?? o.director_nombre ?? null;
      const ap = o.apellido_paterno ?? o.apellidoPaterno ?? o.ap ?? null;
      const am = o.apellido_materno ?? o.apellidoMaterno ?? o.am ?? null;
      const parts = [first, ap, am].filter(Boolean);
      return parts.length ? parts.join(' ').trim() : null;
    };
 
    // primero intentar valores directos del usuario autenticado (mismos aliases que en NuevaReferencia)
    const candidateFromUser =
      currentUser?.directivo_autoriza ??
      currentUser?.directivo ??
      currentUser?.director_unidad ??
      currentUser?.director ??
      currentUser?.nombre_director ??
      currentUser?.director_nombre ??
      null;
    if (candidateFromUser) {
      handleChange('director_unidad', buildFullName(candidateFromUser) ?? candidateFromUser);
      return;
    }
 
    const medicoId = currentUser?.id_medico ?? currentUser?.medicoId ?? null;
    const userId = currentUser?.id_usuario ?? currentUser?.id ?? null;
 
    (async () => {
      try {
        const token = localStorage.getItem('token');
        let medico: any = null;
 
        if (medicoId) {
          const r = await fetch(`${API_BASE}/medicos/${medicoId}`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          if (r.ok) medico = await r.json();
        }
 
        if (!medico && userId) {
          const r = await fetch(`${API_BASE}/medicos/por_usuario/${userId}`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          });
          if (r.ok) medico = await r.json();
        }
 
        // intentar obtener director a partir del objeto medico (varios aliases)
        const directorFromMedico =
          medico?.directivo_autoriza ??
          medico?.directivo ??
          medico?.director_unidad ??
          medico?.director ??
          medico?.nombre_director ??
          medico?.director_nombre ??
          null;
        if (directorFromMedico) {
          handleChange('director_unidad', buildFullName(directorFromMedico) ?? directorFromMedico);
          return;
        }
 
        // si medico tiene id_director, pedir /directors/:id
        const idDirector = medico?.id_director_autoriza ?? medico?.id_director ?? medico?.id_directivo ?? medico?.id_director;
        if (idDirector) {
          try {
            const r2 = await fetch(`${API_BASE}/directors/${idDirector}`, {
              headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            if (r2.ok) {
              const d = await r2.json();
              const directorName = buildFullName(d) ?? (d?.nombre ?? d?.name ?? d?.fullName ?? null);
              if (directorName) {
                handleChange('director_unidad', directorName);
                 return;
               }
             }
           } catch (e) { /* noop */ }
         }
 
         // intentar directors/por_unidad/:unidad
         const unidadId = medico?.id_unidad ?? medico?.idUnidad ?? null;
         if (unidadId) {
           try {
             const r3 = await fetch(`${API_BASE}/directors/por_unidad/${unidadId}`, {
               headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
             });
             if (r3.ok) {
               const dd = await r3.json();
               const directorName = buildFullName(dd) ?? (dd?.nombre ?? dd?.name ?? (dd && [dd.nombre, dd.apellido_paterno, dd.apellido_materno].filter(Boolean).join(' ')) ?? null);
               if (directorName) {
                 handleChange('director_unidad', directorName);
                 return;
               }
             }
           } catch (e) { /* noop */ }
 
           // fallback obtener la unidad y leer campos de director en ella
           try {
             const ru = await fetch(`${API_BASE}/unidades/${unidadId}`, {
               headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
             });
             if (ru.ok) {
               const u = await ru.json();
               const directorFromUnidad = u?.directivo_autoriza ?? u?.director_unidad ?? u?.director ?? u?.nombre_director ?? null;
               const directorName = buildFullName(directorFromUnidad) ?? buildFullName(u) ?? directorFromUnidad;
               if (directorName) {
                 handleChange('director_unidad', directorName);
                 return;
               }
             }
           } catch (e) { /* noop */ }
          }
        } catch (err) {
          console.debug('Autofill director_unidad error', err);
        }
      })();
    }, [currentUser, form.director_unidad]);

  const handleSubmit = async (e?: React.FormEvent) => {
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

    try {
      const token = localStorage.getItem('token');
      // intentar derivar ids numéricos cuando proceda
      const id_servicio_tratante = (() => {
        if (form.servicio_recibio == null || form.servicio_recibio === '') return null;
        const n = Number(form.servicio_recibio);
        return Number.isFinite(n) ? n : null;
      })();
      const id_medico_tratante = currentUser?.id_medico ?? null;
      const id_director_unidad = (form as any).id_director_unidad ?? null; // si lo manejas en otro sitio
      const payload: any = {
        // campos que pide la tabla contrarreferencia
        id_referencia: (form as any).id_referencia ?? null,
        fecha_ingreso: form.fecha_ingreso ?? null,
        fecha_egreso: form.fecha_egreso ?? null,
        dias_estancia: form.dias_atendidos ? Number(form.dias_atendidos) : null,
        diagnostico_egreso: form.diagnostico_egreso ?? '',
        diagnostico_complicaciones: form.diagnostico_complicaciones ?? '',
        resumen_clinico: form.resumen_clinico ?? '',
        id_medico_tratante,
        medico_tratante: form.medico_tratante ?? '',
        id_director_unidad,
        director_unidad: form.director_unidad ?? '',
        id_servicio_tratante,
        servicio_recibio: form.servicio_recibio ?? '',

        // datos adicionales útiles (paciente / contacto / origen)
        no_expediente: form.no_expediente ?? null,
        telefono: form.telefono ?? null,
        nombre_paciente: form.nombre_paciente ?? null,
        apellido_paterno: form.app_paterno ?? null,
        apellido_materno: form.app_materno ?? null,
        curp: form.curp ?? null,
        edad: form.edad ?? null,
        sexo: form.sexo ?? null,
        institucion_recibio: form.institucion_recibio ?? null,
        unidad_medica_solicito: form.unidad_medica_solicito ?? null,
      };

      const res = await fetch(`${API_BASE}/counter-referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        addToast({ title: 'Error', description: json?.message ?? `HTTP ${res.status}`, color: 'danger' });
        console.error('create counter-referral failed', res.status, json);
        return;
      }

      addToast({ title: 'Contrarreferencia', description: 'Contrarreferencia guardada en servidor', color: 'success' });
      console.log('counter-referral created', json);
      navigate("/doctor/referrals");
    } catch (err) {
      console.error('submit counter-referral error', err);
      addToast({ title: 'Error', description: 'No se pudo contactar al servidor', color: 'danger' });
    }
  };

  // 1) Si se nos pasó id_referencia en location.state, usarlo
  React.useEffect(() => {
    try {
      const maybe = (location && (location as any).state) || null;
      const idFromState = maybe?.id_referencia ?? maybe?.referralId ?? maybe?.id;
      if (idFromState) {
        handleChange('id_referencia', Number(idFromState));
        console.log('[NuevaContrarreferencia] inicial id_referencia from state:', idFromState);
      }
    } catch (e) { /* noop */ }
  }, [location]);

  // 2) Fallback: después de lookupCurp, intentar obtener referencias del paciente y usar la más reciente
  const tryFillReferralFromPatient = async (idPaciente: number | null) => {
    if (!idPaciente) return;
    try {
      const token = localStorage.getItem('token');
      // intentar varios endpoints comunes; ajusta al que tenga tu backend
      const endpoints = [
        `${API_BASE}/referrals/paciente/${idPaciente}`,
        `${API_BASE}/referrals/by-patient/${idPaciente}`,
        `${API_BASE}/referrals?paciente=${idPaciente}`
      ];
      for (const ep of endpoints) {
        try {
          const r = await fetch(ep, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
          if (!r.ok) continue;
          const j = await r.json().catch(()=>null);
          const list = Array.isArray(j) ? j : (j?.rows ?? j?.data ?? []);
          if (Array.isArray(list) && list.length) {
            // elegir la referencia más reciente (por fecha_solicitud o id)
            const sorted = list.slice().sort((a,b) => {
              const da = new Date(a.fecha_solicitud || a.createdAt || a.fecha_creacion || 0).getTime();
              const db = new Date(b.fecha_solicitud || b.createdAt || b.fecha_creacion || 0).getTime();
              return db - da;
            });
            const chosen = sorted[0];
            const id = chosen?.id_referencia ?? chosen?.id ?? chosen?.referralId ?? null;
            if (id) {
              handleChange('id_referencia', Number(id));
              console.log('[NuevaContrarreferencia] set id_referencia from patient referrals:', id, ep);
              return;
            }
          }
        } catch (err) { /* intentar siguiente endpoint */ }
      }
    } catch (err) {
      console.debug('tryFillReferralFromPatient error', err);
    }
  };

  // si lookupCurp ya setea id_paciente, llamar a tryFillReferralFromPatient desde allí
  // ejemplo: en lookupCurp, tras obtener p.id_paciente llama tryFillReferralFromPatient(p.id_paciente)

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
                <select
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  value={form.unidad_medica_solicito ?? ""}
                  onChange={(e) => handleChange("unidad_medica_solicito", e.target.value)}
                >
                  <option value="">-- seleccionar unidad --</option>
                  {unidadesList.map((u: any) => (
                    <option key={u.id_unidad ?? u.id} value={u.nombre ?? u.name ?? (u.id_unidad ?? u.id)}>
                      {u.nombre ?? u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Servicio que recibió (en esta unidad)</label>
                <select
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  value={form.servicio_recibio ?? ""}
                  onChange={(e) => handleChange("servicio_recibio", e.target.value)}
                >
                  <option value="">-- seleccionar servicio / especialidad --</option>
                  {especialidadesList.map((s: any) => (
                    <option key={s.id_especialidad ?? s.id} value={s.nombre ?? s.name ?? (s.id_especialidad ?? s.id)}>
                      {s.nombre ?? s.name}
                    </option>
                  ))}
                </select>
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