import { useState, useEffect } from 'react';
import { parseCSVPaste } from '../src/lib/csv';

type BatchRow = { batch: string; expiry: string; qty: number; cost: number; price: number };

export default function AddMedicine() {
  const [name, setName] = useState('');
  const [generic, setGeneric] = useState('');
  const [rack, setRack] = useState('');
  const [minStock, setMinStock] = useState(10);
  const [rows, setRows] = useState<BatchRow[]>([{ batch: '', expiry: '', qty: 0, cost: 0, price: 0 }]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let id: any;
    if (name && name.length >= 2) {
      id = setTimeout(async () => {
        const res = await fetch(`http://localhost:8000/suggest?q=${encodeURIComponent(name)}`);
        const j = await res.json();
        setSuggestions(j);
      }, 220);
    } else {
      setSuggestions([]);
    }
    return () => clearTimeout(id);
  }, [name]);

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      const parsed = parseCSVPaste(text);
      const newRows = parsed.map((r: any) => ({ batch: r[0] || '', expiry: r[1] || '', qty: Number(r[2] || 0), cost: Number(r[3] || 0), price: Number(r[4] || 0) }));
      setRows(prev => [...prev, ...newRows]);
    }
  };

  const addRow = () => setRows([...rows, { batch: '', expiry: '', qty: 0, cost: 0, price: 0 }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof BatchRow, value: any) => {
    const copy = [...rows];
    (copy[i] as any)[field] = value;
    setRows(copy);
  };

  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const totalValue = rows.reduce((s, r) => s + (r.qty * r.price), 0);

  const handleSave = async () => {
    if (!name) return;
    try {
      const data = {
        name,
        generic,
        rack,
        min_stock: minStock,
        batches: rows.filter(r => r.qty > 0).map(r => ({
          batch: r.batch,
          expiry: r.expiry,
          qty: r.qty,
          cost: r.cost,
          price: r.price
        }))
      };
      const res = await fetch('http://localhost:8000/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Reset form
        setName('');
        setGeneric('');
        setRack('');
        setMinStock(10);
        setRows([{ batch: '', expiry: '', qty: 0, cost: 0, price: 0 }]);
      } else {
        alert('Failed to save medicine');
      }
    } catch (error) {
      alert('Error saving medicine');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Toast */}
      {saved && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Medicine saved successfully!
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Add / Update Stock</h1>
            <p className="text-gray-500 text-sm">Add new medicine or update existing stock</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Qty: <span className="font-bold text-gray-900">{totalQty}</span></div>
            <div className="text-sm text-gray-500">Value: <span className="font-bold text-blue-600">₹{totalValue}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Medicine Name with autosuggest */}
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              placeholder="Start typing to search existing medicines..."
              value={name}
              onChange={e => setName(e.target.value)}
              onPaste={onPaste}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-lg"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => { setName(s.name); setGeneric(s.generic); setRack(s.rack); setSuggestions([]); }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                  >
                    <span className="font-medium">{s.name}</span> — <span className="text-gray-500">{s.generic}</span> | Batch: {s.batch} | Rack: {s.rack}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Generic / Salt Name</label>
            <input
              type="text"
              placeholder="e.g., Paracetamol"
              value={generic}
              onChange={e => setGeneric(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rack/Shelf Location</label>
              <input
                type="text"
                placeholder="e.g., A1, B2"
                value={rack}
                onChange={e => setRack(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
              <input
                type="number"
                value={minStock}
                onChange={e => setMinStock(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Batch Table */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Batch Details</h3>
            <button onClick={addRow} className="text-blue-600 hover:text-blue-700 text-sm font-medium">+ Add Another Batch</button>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b">
                  <th className="px-4 py-3 font-medium">Batch No.</th>
                  <th className="px-4 py-3 font-medium">Expiry Date</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Cost Price (₹)</th>
                  <th className="px-4 py-3 font-medium">Selling Price (₹)</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const margin = r.price > 0 ? ((r.price - r.cost) / r.price * 100).toFixed(0) : 0;
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2"><input value={r.batch} onChange={e => updateRow(i, 'batch', e.target.value)} placeholder="e.g., B001" className="w-full px-3 py-2 border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100" /></td>
                      <td className="px-4 py-2"><input type="date" value={r.expiry} onChange={e => updateRow(i, 'expiry', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100" /></td>
                      <td className="px-4 py-2"><input type="number" value={r.qty || ''} onChange={e => updateRow(i, 'qty', Number(e.target.value))} placeholder="0" className="w-20 px-3 py-2 border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100" /></td>
                      <td className="px-4 py-2"><input type="number" value={r.cost || ''} onChange={e => updateRow(i, 'cost', Number(e.target.value))} placeholder="0" className="w-24 px-3 py-2 border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100" /></td>
                      <td className="px-4 py-2"><input type="number" value={r.price || ''} onChange={e => updateRow(i, 'price', Number(e.target.value))} placeholder="0" className="w-24 px-3 py-2 border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100" /></td>
                      <td className="px-4 py-2 text-center">
                        <span className={`font-medium ${Number(margin) >= 15 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {r.price > 0 ? `${margin}%` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(i)} className="text-red-500 hover:text-red-700 p-1">✕</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tip: Paste CSV data (batch,expiry,qty,cost,price) to bulk-add batches.</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <button onClick={() => { setName(''); setGeneric(''); setRack(''); setMinStock(10); setRows([{ batch: '', expiry: '', qty: 0, cost: 0, price: 0 }]); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
            Clear Form
          </button>
          <button onClick={handleSave} disabled={!name} className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition flex items-center gap-2 ${name ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Save Medicine
          </button>
        </div>
      </div>
    </div>
  );
}
