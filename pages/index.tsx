import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// SVG Icons
const Icons = {
  lowStock: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  expiring: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  inventory: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  orders: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  cart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  plus: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  refresh: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  chart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  warning: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  check: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

function MetricCard({ label, value, hint, isAlert, delay, icon }: { label: string; value: string | number; hint: string; isAlert?: boolean; delay?: string; icon: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 card-hover opacity-0 animate-fade-in-up ${delay || ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAlert ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-gray-500 text-sm">{label}</div>
        <div className={`text-2xl font-bold tabular-nums ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
        <div className="text-xs text-gray-400">{hint}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    green: 'bg-emerald-100 text-emerald-700'
  };
  const labels: Record<string, string> = {
    red: 'Critical',
    yellow: 'Warning',
    green: 'OK'
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}

export default function Dashboard() {
  const { data } = useSWR('https://hisdustan26-medico.vercel.app/medicines/summary', fetcher, { refreshInterval: 60000 });

  // Mock today's sales data
  const todaySales = {
    revenue: 2992,
    transactions: 5,
    itemsSold: 15,
    avgOrder: 598
  };

  return (
    <div className="space-y-6">
      {/* Today's Summary - Top Row */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white shadow-lg opacity-0 animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-300 text-sm">Today's Revenue</p>
            <p className="text-3xl font-bold">₹{todaySales.revenue.toLocaleString()}</p>
            <p className="text-emerald-400 text-sm mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              +12% from yesterday
            </p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">{todaySales.transactions}</p>
              <p className="text-slate-400 text-xs">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{todaySales.itemsSold}</p>
              <p className="text-slate-400 text-xs">Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">₹{todaySales.avgOrder}</p>
              <p className="text-slate-400 text-xs">Avg Order</p>
            </div>
          </div>
          <Link href="/sales-history" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition border border-white/20">
            View All Sales →
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={Icons.lowStock} isAlert={true} label="Low Stock" value={data?.lowStockCount ?? '...'} hint="Need reorder" delay="animate-delay-100" />
        <MetricCard icon={Icons.expiring} isAlert={true} label="Expiring Soon" value={data?.expiringCount ?? '...'} hint="Next 30 days" delay="animate-delay-200" />
        <MetricCard icon={Icons.inventory} label="Total Medicines" value={data?.totalMedicines ?? '...'} hint="In inventory" delay="animate-delay-300" />
        <MetricCard icon={Icons.orders} label="Pending Orders" value={data?.pendingPrescriptions ?? '...'} hint="To fulfill" delay="animate-delay-400" />
      </div>

      {/* Quick Actions - Compact */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up animate-delay-500">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-400">Keyboard shortcuts available</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/new-sale" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
            {Icons.cart} New Sale <span className="text-blue-200 text-xs ml-1">⌘N</span>
          </Link>
          <Link href="/add-medicine" className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition text-sm">
            {Icons.plus} Add Stock <span className="text-slate-300 text-xs ml-1">⌘⇧A</span>
          </Link>
          <Link href="/restock" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition text-sm border border-slate-200">
            {Icons.refresh} Restock List
          </Link>
          <Link href="/sales-history" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition text-sm border border-slate-200">
            {Icons.chart} Sales History
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Sales + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up animate-delay-550">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Sales</h2>
            <Link href="/sales-history" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {[
              { id: 'INV005', time: '3:45 PM', customer: 'Amit Sharma', amount: 1250 },
              { id: 'INV004', time: '2:30 PM', customer: 'Walk-in', amount: 245 },
              { id: 'INV003', time: '12:00 PM', customer: 'Sunita Devi', amount: 892 },
            ].map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.customer}</p>
                    <p className="text-xs text-gray-400">{sale.time} • {sale.id}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">₹{sale.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Today */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up animate-delay-550">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Selling Today</h2>
            <span className="text-xs text-gray-400">By quantity</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Paracetamol 500mg', qty: 24, revenue: 480 },
              { name: 'Cetirizine 10mg', qty: 18, revenue: 360 },
              { name: 'Azithromycin 500mg', qty: 12, revenue: 1440 },
            ].map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.qty} units sold</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">₹{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Items Table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up animate-delay-600">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-amber-500">{Icons.warning}</span>
            Urgent Attention Required
          </h2>
          <Link href="/restock" className="text-xs text-blue-600 hover:underline">View All →</Link>
        </div>

        {(!data || !data.urgent || data.urgent.length === 0) ? (
          <div className="py-8 text-center text-gray-400">
            <div className="text-emerald-500 flex justify-center mb-3">{Icons.check}</div>
            <div className="font-medium text-gray-600 mb-1">All clear — inventory is healthy</div>
            <div className="text-sm">No items are expired or critically low.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b bg-gray-50">
                  <th className="px-3 py-2.5 font-medium rounded-l-lg">Medicine</th>
                  <th className="px-3 py-2.5 font-medium">Batch</th>
                  <th className="px-3 py-2.5 font-medium">Stock</th>
                  <th className="px-3 py-2.5 font-medium">Expiry</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.urgent.slice(0, 4).map((u: any, idx: number) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-gray-900">{u.name}</td>
                    <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">{u.batch}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${u.qty <= 0 ? 'bg-red-100 text-red-700' : u.qty <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.qty}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{u.expiry}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="px-3 py-2.5">
                      <Link href="/add-medicine" className="text-blue-600 hover:underline text-xs font-medium">+ Add Stock</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
