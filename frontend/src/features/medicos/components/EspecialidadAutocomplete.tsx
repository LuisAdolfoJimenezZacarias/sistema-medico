import React from 'react';
type Especialidad = { id_especialidad?: number; id?: number; nombre?: string; name?: string; };

export default function EspecialidadAutocomplete({
  especialidades = [],
  value = '',
  onChange,
  onSelect,
  placeholder = 'Selecciona la especialidad',
  disabled = false
}: {
  especialidades?: Especialidad[];
  value?: string;
  onChange: (v: string) => void;
  onSelect: (s: Especialidad) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = React.useState<string>(value ?? '');
  const [open, setOpen] = React.useState<boolean>(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => { if (value !== undefined && value !== query) setQuery(value ?? ''); /* eslint-disable-next-line*/ }, [value]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current) return; if (!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = React.useMemo(() => {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return (especialidades || []).slice();
    return (especialidades || []).filter((s: any) => ((s.nombre ?? s.name ?? '') as string).toLowerCase().includes(q));
  }, [especialidades, query]);

  const handleInput = (v: string) => { setQuery(v); onChange(v); setOpen(true); };
  const handleSelect = (s: Especialidad) => { const nombre = s.nombre ?? s.name ?? ''; setQuery(nombre); onSelect(s); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
      />
      {open && items.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
          {items.map((s: any) => (
            <li key={s.id_especialidad ?? s.id} onMouseDown={(ev) => { ev.preventDefault(); handleSelect(s); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
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
}