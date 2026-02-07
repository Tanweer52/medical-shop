import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// SVG Icons
const Icons = {
  download: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  chart: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  eye: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  print: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  trendUp: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  cash: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  phone: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  card: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
};

export default function SalesHistory() {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch sales data only when mounted
  const { data: salesData, error } = useSWR(mounted ? 'https://hisdustan26-medico.vercel.app/sales' : null, fetcher);

  const sales = salesData || [];

  // Prevent SSR issues
  if (!mounted) {
    return <div>Loading...</div>;
  }

  // Helper to parse date string from backend (ISO format)
  function parseDate(dateStr: string) {
    return new Date(dateStr);
  }

  // Date filter logic
  const now = new Date();
  let start: Date | null = null, end: Date | null = null;
  if (dateFilter === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (dateFilter === 'week') {
    const day = now.getDay();
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day));
  } else if (dateFilter === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  // If custom range
  if (dateFrom) start = new Date(dateFrom);
  if (dateTo) end = new Date(dateTo);

  const filteredSales = sales.filter(sale => {
    // Payment filter
    if (filter !== 'all' && sale.payment_method !== filter) return false;
    // Search filter (customer or invoice)
    if (search && !(
      sale.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      sale.id.toString().toLowerCase().includes(search.toLowerCase())
    )) return false;
    // Date filter
    if (start && end) {
      const saleDate = parseDate(sale.date);
      if (saleDate < start || saleDate >= end) return false;
    }
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-500">View and manage past transactions</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
            {Icons.download} Export CSV
          </button>
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition text-sm flex items-center gap-2">
            {Icons.chart} Generate Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Today's Sales</p>
          <p className="text-2xl font-bold text-gray-900">₹2,992</p>
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">{Icons.trendUp} 12% from yesterday</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-xs text-gray-500 mt-1">Today</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900">₹598</p>
          <p className="text-xs text-gray-500 mt-1">Per transaction</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Top Payment</p>
          <p className="text-2xl font-bold text-gray-900">UPI</p>
          <p className="text-xs text-gray-500 mt-1">45% of sales</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-gray-500">Filter by:</span>
          {/* Date range */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'all', label: 'All Time' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setDateFilter(opt.value); setDateFrom(''); setDateTo(''); }}
                className={`px-3 py-1.5 rounded-md text-sm transition ${dateFilter === opt.value && !dateFrom && !dateTo ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Custom date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setDateFilter('all'); }}
            className="px-2 py-1.5 rounded-md text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
            placeholder="From"
            style={{width:120}}
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setDateFilter('all'); }}
            className="px-2 py-1.5 rounded-md text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
            placeholder="To"
            style={{width:120}}
          />
          <div className="w-px h-6 bg-gray-200 mx-2" />
          {/* Payment type */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1 ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('cash')}
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1 ${filter === 'cash' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {Icons.cash} Cash
            </button>
            <button
              onClick={() => setFilter('upi')}
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1 ${filter === 'upi' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {Icons.phone} UPI
            </button>
            <button
              onClick={() => setFilter('card')}
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1 ${filter === 'card' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {Icons.card} Card
            </button>
          </div>
          {/* Search */}
          <input
            type="text"
            placeholder="Search customer or invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-md text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 min-w-[180px]"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-6 py-4 font-medium">Invoice #</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-center">Items</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, idx) => (
                <tr key={sale.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono text-blue-600 font-medium">{sale.id}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{new Date(sale.date).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={sale.customer_name === 'Walk-in' ? 'text-gray-400' : 'text-gray-900'}>{sale.customer_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{sale.items.length}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {sale.payment_method === 'cash' ? Icons.cash : sale.payment_method === 'upi' ? Icons.phone : Icons.card} {sale.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">₹{sale.total}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500" title="View Details">{Icons.eye}</button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500" title="Print">{Icons.print}</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-6 py-4 text-gray-900">Total ({totalTransactions} transactions)</td>
                <td className="px-6 py-4 text-center text-gray-600">{filteredSales.reduce((s, sale) => s + sale.items.length, 0)}</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-blue-600 text-lg">₹{totalRevenue}</td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
