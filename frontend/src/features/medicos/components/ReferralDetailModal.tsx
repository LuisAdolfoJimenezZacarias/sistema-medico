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

  // ref al contenido que vamos a imprimir
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    const doc = data ?? {};
    const refId = doc.folio ?? doc.no_folio ?? doc._raw?.id ?? new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    const filename = `Referencia_${refId}`;

    const rawContent = contentRef.current?.innerHTML ?? '<div>No hay contenido para imprimir</div>';
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      console.warn('No se pudo abrir ventana de impresión');
      return;
    }

    // Clonar head para mantener estilos globales y añadir reglas de impresión + escala a 1 hoja Letter
    const headHtml = document.head.innerHTML;
    const extraStylesAndScript = `
      <style>
        @page { size: Letter; margin: 12mm; }
        html,body{margin:0;padding:0;height:100%;width:100%;font-family:inherit;color:inherit;background:white;-webkit-print-color-adjust:exact;color-adjust:exact;}
        /* caja de impresión que usa todo el ancho disponible, sin escalado (mejor calidad) */
        .print-sheet { box-sizing: border-box; width:100%; max-width:216mm; min-height:279.4mm; padding:12mm; margin:0 auto; background:white; }
        #print-content { width:100%; box-sizing: border-box; }
        /* asegurar imágenes y svg responsivos dentro de la hoja */
        #print-content img, #print-content svg { max-width:100%; height:auto; image-rendering: optimizeQuality; }
        /* prevenir que controles interactivos aparezcan en impresión */
        button, a, input, textarea, [role="button"] { display:none !important; }
        /* evitar quiebres dentro de bloques importantes */
        .no-break { page-break-inside: avoid; }
        /* reglas específicas para impresión */
        @media print {
          body { margin:0; }
          .print-sheet { box-shadow:none; margin:0; padding:10mm; width:100%; }
          /* forzar color real en impresión */
          * { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
      </style>
      <script>
        // Esperar a que imágenes externas carguen y luego notificar ready; ya no escalamos con transform para preservar calidad
        function waitForMediaAndReady(cb){
          var imgs = Array.from(document.querySelectorAll('#print-content img'));
          if (!imgs.length) return cb();
          var loaded = 0;
          imgs.forEach(function(i){
            if (i.complete) { loaded++; if (loaded===imgs.length) cb(); return; }
            i.addEventListener('load', function(){ loaded++; if (loaded===imgs.length) cb(); });
            i.addEventListener('error', function(){ loaded++; if (loaded===imgs.length) cb(); });
          });
        }
        window.addEventListener('load', function(){ setTimeout(function(){ waitForMediaAndReady(function(){ /* listo para imprimir */ }); }, 150); });
      </script>
    `;
    const bodyHtml = `
      <div id="print-wrapper">
        <div class="print-sheet">
          <div id="print-content" class="no-break">${rawContent}</div>
        </div>
      </div>
    `;

    // construir documento completo manteniendo head (estilos) + extras
    printWindow.document.open();
    // usar concatenación para evitar problemas de parsing con caracteres especiales en headHtml
    printWindow.document.write('<!doctype html><html><head><title>' + filename + '</title>' + headHtml + extraStylesAndScript + '</head><body>' + bodyHtml + '</body></html>');
    printWindow.document.close();
    printWindow.document.title = filename;
    printWindow.focus();

    // dar tiempo a cargar recursos y luego imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 900);
  };

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
            // asegurarse de mostrar 'procedimiento' (DB) en el campo "Diagnóstico de envío"
            diagnostico_envio: json.diagnostico_envio ?? json.procedimiento ?? '',
            procedimiento: json.procedimiento ?? json.diagnostico_envio ?? '',
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
            medico_solicitante: json.medico_remitente
              ? [json.medico_remitente.nombre, json.medico_remitente.apellido_paterno, json.medico_remitente.apellido_materno].filter(Boolean).join(' ')
              : (json.medico_solicitante ?? ''),
            directivo_autoriza: json.director_autoriza
              ? [json.director_autoriza.nombre, json.director_autoriza.apellido_paterno, json.director_autoriza.apellido_materno].filter(Boolean).join(' ')
              : (json.directivo_autoriza ?? ''),
            _raw: json
          };

          // Si no se obtuvo el director en la carga, intentar resolverlo por la unidad origen
          if (!mapped.directivo_autoriza) {
            const unidadId = json.unidad_origen?.id_unidad ?? json.unidad_origen?.id ?? json.id_unidad_origen ?? null;
            if (unidadId) {
              try {
                const directorUrl = `${API_BASE}/api/directors/por_unidad/${unidadId}`;
                const resDir = await fetch(directorUrl, { headers: { Accept: 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
                if (resDir.ok) {
                  const d = await resDir.json();
                  const nombreDir = [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' ').trim();
                  if (nombreDir) {
                    mapped.directivo_autoriza = nombreDir;
                  }
                }
              } catch (err) {
                console.debug('ReferralDetailModal: no se pudo obtener director por unidad', err);
              }
            }
          }

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
                <div ref={contentRef}>
                  <ReferralForm formData={data} readOnly />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="danger" onPress={() => onClose()}>Cerrar</Button>
              <Button color="primary" onPress={handlePrint}>Imprimir</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}