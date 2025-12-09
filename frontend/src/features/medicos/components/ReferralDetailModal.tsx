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
    const original = contentRef.current;
    if (!original) return console.warn('No hay contenido para imprimir');

    const doc = data ?? {};
    const refId = doc.folio ?? doc.no_folio ?? doc._raw?.id ?? new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    const filename = 'Referencia_' + String(refId);

    // helper para escapar texto y evitar que HTML romp a la plantilla
    const escapeHtml = (s: any) => {
      const str = String(s ?? '');
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    };

    // clonar nodo para transformar sin tocar DOM real
    const clone = original.cloneNode(true) as HTMLElement;

    // reemplazar controles por texto legible para impresión
    const replaceControls = (root: HTMLElement) => {
      Array.from(root.querySelectorAll('input')).forEach((n) => {
        const inp = n as HTMLInputElement;
        const span = document.createElement('span');
        span.className = 'print-value';
        if (inp.type === 'checkbox' || inp.type === 'radio') span.textContent = inp.checked ? 'Sí' : 'No';
        else span.textContent = inp.value ?? inp.getAttribute('value') ?? '';
        n.parentNode?.replaceChild(span, n);
      });
      Array.from(root.querySelectorAll('select')).forEach((n) => {
        const s = n as HTMLSelectElement;
        const span = document.createElement('span');
        span.className = 'print-value';
        span.textContent = (s.selectedOptions && s.selectedOptions.length) ? Array.from(s.selectedOptions).map(o => o.text).join(', ') : s.value ?? '';
        n.parentNode?.replaceChild(span, n);
      });
      Array.from(root.querySelectorAll('textarea')).forEach((n) => {
        const ta = n as HTMLTextAreaElement;
        const div = document.createElement('div');
        div.className = 'print-value print-textarea';
        div.innerHTML = (ta.value || '').replace(/\n/g, '<br/>');
        n.parentNode?.replaceChild(div, n);
      });
      Array.from(root.querySelectorAll('button, a, .no-print, [data-no-print]')).forEach(n => n.parentNode?.removeChild(n));
    };

    replaceControls(clone);

    // construir el bloque de "Información de la Solicitud" con los datos mapeados
    const solicitudHtml =
      '<div class="print-info-section" style="border:1px solid #e6e6e6;padding:8px;border-radius:6px;margin-bottom:8px;">' +
        '<h3 style="margin:0 0 6px;font-size:14px;color:#111;">Información de la Solicitud</h3>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          '<div style="min-width:220px;"><strong>Tipo de solicitud:</strong><div>' + escapeHtml(doc.tipo_solicitud || '') + '</div></div>' +
          '<div style="min-width:220px;"><strong>Tipo de paciente:</strong><div>' + escapeHtml(doc.tipo_paciente || '') + '</div></div>' +
          '<div style="min-width:220px;"><strong>No. Expediente:</strong><div>' + escapeHtml(doc.no_expediente || '') + '</div></div>' +
          '<div style="min-width:220px;"><strong>No. solicitud / folio:</strong><div>' + escapeHtml(doc.folio ?? doc.no_folio ?? '') + '</div></div>' +
          '<div style="min-width:220px;"><strong>Fecha de solicitud:</strong><div>' + escapeHtml(doc.fecha_solicitud ? String(doc.fecha_solicitud).slice(0,10) : '') + '</div></div>' +
        '</div>' +
      '</div>';

    // envolver en estructura de impresión (mantener orden/estilos)
    const wrapper = document.createElement('div');
    wrapper.id = 'print-wrapper';
    wrapper.style.boxSizing = 'border-box';

    // añadir encabezado impreso (titulo + info de solicitud) antes del contenido clonado
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML =
      '<div style="margin-bottom:10px;">' +
        '<h1 style="font-size:18px;margin:0 0 6px;color:#1f4ed8;">Hoja de Referencia Médica</h1>' +
        '</div>' +
        solicitudHtml;
    wrapper.appendChild(headerContainer);
    wrapper.appendChild(clone);

    // head + CSS de impresión (mantiene head para estilos globales y añade reglas print que conservan diseño)
    const headHtml = document.head.innerHTML;
    const printCss =
      '<style>' +
      '@page{size:letter;margin:12mm;} ' +
      'html,body{margin:0;padding:0;background:white;color:#111;font-family:inherit;} ' +
      '#print-wrapper{width:100%;max-width:216mm;box-sizing:border-box;padding:6mm;} ' +
      '#print-wrapper{font-size:11px;line-height:1.05;} ' +
      '#print-wrapper .print-textarea{white-space:pre-wrap;word-break:break-word;} ' +
      '.print-value{color:inherit;} ' +
      'button,a,input,textarea,select{display:none !important;} ' +
      '.print-two-col{display:grid;grid-template-columns:1fr 1fr;gap:8px;} ' +
      '.print-full{grid-column:1 / -1;} ' +
      // asegurar que los estilos del header no se pierdan
      '.print-info-section h3{margin:0 0 6px;font-weight:600;} ' +
      '</style>';

    // script que ajusta escala SOLO si es estrictamente necesario (preservar nitidez)
    const fitScript =
      '<script>' +
      'function mmToPx(mm){return Math.round(mm * 96 / 25.4);} ' +
      'function fitAndPrint(){' +
        'try{' +
          'var content=document.getElementById("print-wrapper"); if(!content){ window.print(); return; }' +
          'var availH = mmToPx(279.4 - 24); /* Letter height minus margins */' +
          'var contentH = content.scrollHeight; var scale = 1;' +
          'if(contentH > availH){ scale = Math.max(0.65, availH / contentH); /* no escalar menos de 0.65 para mantener legibilidad */ }' +
          'if(scale < 1){ content.style.transformOrigin="top left"; content.style.transform="scale("+scale+")"; }' +
          'setTimeout(function(){ window.print(); }, 300);' +
        '}catch(e){ console.error(e); window.print(); }' +
      '}' +
      'window.addEventListener("load", function(){ setTimeout(fitAndPrint, 300); });' +
      '</script>';

    // construir HTML por concatenación
    let html = '<!doctype html><html><head><title>' + filename + '</title>' + headHtml + printCss + '</head><body>';
    html += wrapper.outerHTML;
    html += fitScript;
    html += '</body></html>';

    // abrir ventana e imprimir
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return console.warn('No se pudo abrir ventana de impresión');
    try {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.document.title = filename;
      printWindow.focus();
      // cierre opcional (el script interno lanza print)
      setTimeout(() => { try { printWindow.close(); } catch (e) {} }, 5000);
    } catch (err) {
      console.error('Error al preparar impresión', err);
      try { printWindow.close(); } catch (e) {}
    }
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