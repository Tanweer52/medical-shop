import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

function useGlobalShortcuts() {
  const router = useRouter();
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.querySelector('input[placeholder*="Search"]') as HTMLElement | null;
        el?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        router.push('/new-sale');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        router.push('/add-medicine');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [router]);
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalShortcuts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      fetch(`/api/medicines?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          setResults(data);
          setShowDropdown(true);
        });
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 px-3 py-2 rounded-lg font-bold text-lg">SK</div>
            <div>
              <div className="font-semibold text-lg leading-tight">Medico</div>
              <div className="text-xs text-white/70">Medical Center</div>
            </div>
          </div>

          {/* Search Bar in Header */}
          <div className="relative flex-1 max-w-md mx-8" ref={dropdownRef}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search medicines... (Ctrl+K)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition shadow-sm"
            />
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-auto z-50">
                {results.map((m: any) => (
                  <div key={m.id} className="p-3 hover:bg-gray-50 border-b last:border-0 cursor-pointer" onClick={() => { setShowDropdown(false); setQuery(''); }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{m.name}</div>
                        <div className="text-xs text-gray-500">
                          <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mr-2">{m.generic}</span>
                          Batch: {m.batch} • Rack: {m.rack}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${m.qty <= 5 ? 'text-red-600' : 'text-green-600'}`}>Qty: {m.qty}</div>
                        <div className="text-xs text-gray-500">Exp: {m.expiry}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && query.length >= 2 && results.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center text-gray-500 z-50">
                No medicines found
              </div>
            )}
          </div>

          <nav className="flex items-center gap-5 text-sm">
            <Link href="/" className="hover:text-white/80 transition">Dashboard</Link>
            <Link href="/add-medicine" className="hover:text-white/80 transition">Add Stock</Link>
            <Link href="/restock" className="hover:text-white/80 transition">Restock</Link>
            <Link href="/sales-history" className="hover:text-white/80 transition">Sales</Link>
            <Link href="/new-sale" className="bg-white/20 px-4 py-1.5 rounded-full hover:bg-white/30 transition font-medium">+ New Sale</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
