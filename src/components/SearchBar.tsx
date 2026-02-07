import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const SearchBar: React.FC = () => {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data } = useSWR(q ? `/api/medicines?q=${encodeURIComponent(q)}` : null, fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search by name, generic, batch, rack — (Ctrl+K)"
        value={q}
        onChange={e => setQ(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-lg"
      />
      <div>
        {data?.length === 0 && q && <p className="text-gray-500">No results</p>}
        {data?.map((m: any) => (
          <div key={m.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-900">
                {m.name} <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{m.generic}</span>
              </div>
              <div className="text-sm text-gray-500">Batch: {m.batch} • Rack: {m.rack}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">Qty: {m.qty}</div>
              <div className="text-sm text-gray-500">Exp: {m.expiry}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
