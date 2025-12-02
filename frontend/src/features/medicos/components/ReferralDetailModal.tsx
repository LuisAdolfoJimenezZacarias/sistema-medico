import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@heroui/react';
import { useAuth } from '../../../context/auth-context';
import ReferralView from './ReferralView';
import ReferralForm from './ReferralForm';

type Props = {
  referralId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ReferralDetailModal({ referralId, isOpen, onClose }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (!isOpen || !referralId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // token: prefer context, fallback a posibles keys en localStorage
        const t = token || localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('authToken');
        const rawBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5000';
        const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api$/i, '');
        // Ajuste: tu router registra GET /api/referrals/id/:id
        const url = `${API_BASE}/api/referrals/id/${encodeURIComponent(referralId)}`;
        const res = await fetch(url, { headers: { Accept: 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) {
          // Mapear la respuesta del backend a la forma que espera ReferralForm
          const p = json.paciente ?? json.paciente_ref ?? json.patient ?? {};
          const fechaNacimientoRaw = p.fecha_nacimiento ?? p.birth_date ?? json.fecha_nacimiento ?? '';
          // devuelve "N" (años) o "M meses" si es menor a 1 año
          const getAgeString = (d: string) => {
            if (!d) return '';
            const bd = new Date(d);
            if (isNaN(bd.getTime())) return '';
            const now = new Date();
            let years = now.getFullYear() - bd.getFullYear();
            let months = now.getMonth() - bd.getMonth();
            const days = now.getDate() - bd.getDate();
            if (days < 0) months -= 1;
            if (months < 0) {
              years -= 1;
              months += 12;
            }
            if (years >= 1) return String(years); // mantener formato previo para >=1 año
            // para infantes mostrar meses (1 mes, 2 meses, 0 meses si nació este mes)
            return `${Math.max(0, months)} meses`;
          };
          // normalizar sexo/género a los valores que usa ReferralForm ('mujer' | 'hombre' | 'Otro')
          const rawGenero = (p.genero ?? p.sexo ?? json.sexo ?? '').toString();
          const normalizeGenero = (g: string) => {
            if (!g) return '';
            const s = g.trim().toLowerCase();
            if (s === 'm' || s === 'masculino' || s === 'male' || s === 'hombre') return 'hombre';
            if (s === 'f' || s === 'femenino' || s === 'female' || s === 'mujer') return 'mujer';
            return (g === 'Otro' || s === 'otro') ? 'Otro' : '';
          };
          const computedEdad = (json.edad ?? p.edad) ? String(json.edad ?? p.edad) : getAgeString(fechaNacimientoRaw);
           const mapped = {
             // solicitud
             no_folio: json.folio ?? json.no_folio ?? '',
             folio: json.folio ?? json.no_folio ?? '',
             no_expediente: json.no_expediente ?? json.expediente ?? '',
             fecha_solicitud: json.fecha_solicitud ? new Date(json.fecha_solicitud).toISOString() : (json.fecha_solicitud ?? ''),
             tipo_solicitud: json.tipo_solicitud ?? '',
             tipo_paciente: json.tipo_paciente ?? '',
             prioridad: json.prioridad ?? (json.prioridad ?? 'Media'),
             // paciente
             id_paciente: json.id_paciente ?? p.id_paciente ?? p.id ?? null,
             nombre_paciente: p.nombre ?? json.nombre_paciente ?? json.nombre ?? '',
             app_paterno: p.apellido_paterno ?? p.last_name ?? json.app_paterno ?? json.apellido_paterno ?? '',
             app_materno: p.apellido_materno ?? json.app_materno ?? json.apellido_materno ?? '',
             domicilio: p.domicilio ?? p.address ?? json.domicilio ?? '',
             fecha_nacimiento: fechaNacimientoRaw ?? '',
             edad: computedEdad ?? '',
             sexo: normalizeGenero(rawGenero) ?? '',
             curp: p.curp ?? p.CURP ?? json.curp ?? '',
             // <- aquí: leer familiar responsable desde 'paciente' en sus variantes
             familiar_responsable: p.familiar_responsable ?? p.familiarResponsable ?? json.familiar_responsable ?? json.familiarResponsable ?? '',
             telefono: p.telefono ?? p.phone ?? json.telefono ?? '',
             // unidad / servicio
             institucion: json.unidad_origen?.nombre ?? json.unidad_origen_nombre ?? '',
             unidad_origen_nombre: json.unidad_origen?.nombre ?? json.unidad_origen_nombre ?? '',
             unidad_destino_nombre: json.unidad_destino?.nombre ?? json.unidad_destino_nombre ?? '',
             servicio: json.especialidad_ref?.nombre ?? json.especialidad?.nombre ?? json.servicio ?? '',
             // texto libre
             motivo_envio: json.motivo_envio ?? '',
             resumen_clinico: json.resumen_clinico ?? '',
             diagnostico_envio: json.diagnostico_envio ?? '',
             procedimiento: json.procedimiento ?? '',
             // signos vitales
             peso: json.peso ?? '',
             talla: json.talla ?? '',
             fc: json.fc ?? '',
             fr: json.fr ?? '',
             temp: json.temp ?? '',
             ta: json.ta ?? '',
             spo2: json.spo2 ?? '',
             dextrostix: json.dextrostix ?? json.dextrostix ?? '',
             // medico / autorizacion
             medico_solicitante: json.medico_remitente ? `${json.medico_remitente.nombre ?? ''} ${json.medico_remitente.apellido_paterno ?? ''}`.trim() : (json.medico_solicitante ?? ''),
             directivo_autoriza: json.director_autoriza ? `${json.director_autoriza.nombre ?? ''} ${json.director_autoriza.apellido_paterno ?? ''}`.trim() : (json.directivo_autoriza ?? ''),
             // raw backend object por si hace falta
             _raw: json
           };
          setData(mapped);
        }
       } catch (err) {
         console.error('ReferralDetailModal fetch error', err);
         if (mounted) setData(null);
       } finally {
         if (mounted) setLoading(false);
       }
     })();
     return () => { mounted = false; };
   }, [isOpen, referralId, token]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        {(onCloseInner) => (
          <>
            <ModalHeader>
              Detalle de Referencia
              <div className="text-sm text-gray-500 mt-1">{data?.folio ? `Folio: ${data.folio}` : ''}</div>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="py-10 flex justify-center"><Spinner /></div>
              ) : !data ? (
                <div className="py-6 text-center text-sm text-red-600">No se pudo cargar la referencia.</div>
              ) : (
                // pasar la data cruda al formulario en modo solo lectura
                <ReferralForm formData={data} readOnly />
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="danger" onPress={() => onClose()}>Cerrar</Button>
              <Button color="primary" onPress={() => { /* opcional: imprimir */ }}>Imprimir</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}