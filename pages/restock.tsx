import useSWR from 'swr';
import { exportCSV } from '../src/lib/csv';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// SVG Icons
const Icons = {
  download: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    green: 'bg-slate-100 text-slate-600'
  };
  const labels: Record<string, string> = {
    red: 'Critical',
    yellow: 'Low Stock',
    green: 'OK'
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}

export default function Restock() {
  const { data } = useSWR('https://hisdustan26-medico.vercel.app/medicines/summary', fetcher, { refreshInterval: 60000 });
  const [statusFilter, setStatusFilter] = useState<'all'|'red'|'yellow'|'green'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all'|'expired'|'expiringSoon'>('all');
  const [search, setSearch] = useState('');

  const handleExport = () => {
    const rows = [['Medicine', 'Needed', 'OnHand', 'Expiry', 'Status'], ...(filteredRestock || []).map((r: any) => [r.name, String(r.suggested), String(r.qty), r.expiry, r.status])];
    exportCSV('purchase_suggestions.csv', rows);
  };

  // Filtering logic
  const filteredRestock = (data?.restock || []).filter((r: any) => {
    // Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    // Expiry filter
    const days = (() => {
      const d = new Date(r.expiry);
      const now = new Date();
      return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    })();
    if (expiryFilter === 'expired' && days >= 0) return false;
    if (expiryFilter === 'expiringSoon' && (days > 30 || days < 0)) return false;
    // Search filter
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Restock & Expiry</h1>
          <p className="text-sm text-gray-500">Auto-generated Purchase Suggestions</p>
        </div>
        <button onClick={handleExport} className="px-5 py-2.5 bg-slate-700 text-white rounded-lg font-medium shadow-md hover:bg-slate-800 transition flex items-center gap-2">
          {Icons.download} Export PO CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-4 animate-fade-in-up" style={{animationDelay:'100ms'}}>
        <span className="text-sm text-gray-500">Filter by:</span>
        {/* Status */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[{label:'All', value:'all'},{label:'Critical', value:'red'},{label:'Low Stock', value:'yellow'},{label:'OK', value:'green'}].map(opt => (
            <button
              key={opt.value}
              onClick={()=>setStatusFilter(opt.value as any)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${statusFilter===opt.value?'bg-white shadow text-gray-900':'text-gray-600 hover:text-gray-900'}`}
            >{opt.label}</button>
          ))}
        </div>
        {/* Expiry */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[{label:'All Expiry', value:'all'},{label:'Expired', value:'expired'},{label:'Expiring Soon', value:'expiringSoon'}].map(opt => (
            <button
              key={opt.value}
              onClick={()=>setExpiryFilter(opt.value as any)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${expiryFilter===opt.value?'bg-white shadow text-gray-900':'text-gray-600 hover:text-gray-900'}`}
            >{opt.label}</button>
          ))}
        </div>
        {/* Search */}
        <input
          type="text"
          placeholder="Search medicine..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-md text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 min-w-[180px]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b bg-slate-50">
              <th className="pb-3 font-medium">Medicine</th>
              <th className="pb-3 font-medium">Needed Qty</th>
              <th className="pb-3 font-medium">Qty On Hand</th>
              <th className="pb-3 font-medium">Expiry</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestock.map((r: any, idx: number) => {
              // Row coloring: red/yellow/green for status, alternate bg for OK
              let rowBg = '';
              if (r.status === 'red') rowBg = 'bg-red-50';
              else if (r.status === 'yellow') rowBg = 'bg-amber-50';
              else if (r.status === 'green' && idx % 2 === 1) rowBg = 'bg-slate-50';
              return (
                <tr key={r.id} className={`border-b last:border-0 hover:bg-blue-50 transition ${rowBg}`}>
                  <td className="py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="py-3 text-blue-600 font-semibold">{r.suggested}</td>
                  <td className={`py-3 font-medium ${r.qty <= 5 ? 'text-red-600' : 'text-gray-600'}`}>{r.qty}</td>
                  <td className="py-3 text-gray-600">{r.expiry}</td>
                  <td className="py-3"><StatusBadge status={r.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredRestock.length === 0 && (
          <div className="text-center text-gray-400 py-8">No medicines found for selected filters.</div>
        )}
      </div>
    </div>
  );
}
