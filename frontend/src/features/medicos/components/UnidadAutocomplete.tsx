import React from 'react';
type Unidad = { id_unidad?: number; id?: number; nombre?: string; name?: string; };

export default function UnidadAutocomplete({
  unidades = [],
  value = '',
  onChange,
  onSelect,
  placeholder = 'Selecciona la unidad destino',
  disabled = false
}: {
  unidades?: Unidad[];
  value?: string;
  onChange: (v: string) => void;
  onSelect: (u: Unidad) => void;
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
    if (!q) return (unidades || []).slice();
    return (unidades || []).filter((u: any) => ((u.nombre ?? u.name ?? '') as string).toLowerCase().includes(q));
  }, [unidades, query]);

  const handleInput = (v: string) => { setQuery(v); onChange(v); setOpen(true); };
  const handleSelect = (u: Unidad) => { const nombre = u.nombre ?? u.name ?? ''; setQuery(nombre); onSelect(u); setOpen(false); };

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
          {items.map((u: any) => (
            <li key={u.id_unidad ?? u.id} onMouseDown={(ev) => { ev.preventDefault(); handleSelect(u); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
              {u.nombre ?? u.name}
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
}