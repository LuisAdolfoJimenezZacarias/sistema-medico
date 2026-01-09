export const resolveAdminUnit = (user: any) => {
  const raw =
    user?.id_unidad ??
    user?.unidadId ??
    user?.unidad ??
    user?.unidad?.id ??
    user?.facility ??           // ej. "imss24"
    user?.facilityName ??
    user?.clues ??
    user?.unidad_origen ??
    null;

  const unidadId = raw != null && !Number.isNaN(Number(raw)) ? String(Number(raw)) : null;
  const unidadName = !unidadId && raw ? String(raw) : null;

  return { unidadId, unidadName };
};