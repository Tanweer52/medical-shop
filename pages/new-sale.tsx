import { useState, useEffect, useRef } from 'react';

// SVG Icons
const Icons = {
  cart: <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  print: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
  plus: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  cash: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  phone: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  card: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
};

export default function NewSale() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showBill, setShowBill] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Search medicines from API
  useEffect(() => {
    if (search.length >= 2) {
      fetch(`http://localhost:8000/medicines?q=${encodeURIComponent(search)}`)
        .then(r => r.json())
        .then(data => setSearchResults(data));
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const addItem = (medicine: any) => {
    const existing = items.find(it => it.id === medicine.id);
    if (existing) {
      setItems(items.map(it => it.id === medicine.id ? { ...it, qty: it.qty + 1 } : it));
    } else {
      setItems([...items, { ...medicine, qty: 1, price: Math.floor(Math.random() * 100) + 20 }]); // Mock price
    }
    setSearch('');
    setSearchResults([]);
    searchRef.current?.focus();
  };

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(it => {
      if (it.id === id) {
        const newQty = Math.max(1, it.qty + delta);
        return { ...it, qty: newQty };
      }
      return it;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const completeSale = async () => {
    if (items.length === 0) return;
    try {
      const saleData = {
        customer_name: customerName || 'Walk-in',
        items: items.map(it => ({ medicine_id: it.id, qty: it.qty, price: it.price })),
        payment_method: paymentMethod,
        total
      };
      const res = await fetch('http://localhost:8000/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      if (!res.ok) {
        const error = await res.json();
        alert('Sale failed: ' + error.detail);
        return;
      }
      setShowBill(true);
    } catch (error) {
      alert('Error completing sale');
    }
  };

  const newSale = () => {
    setItems([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
    setShowBill(false);
  };

  if (showBill) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-fade-in">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-xl font-bold">Medico Medical Center</h1>
          <p className="text-sm text-gray-500">Invoice / Bill</p>
          <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
        </div>

        {customerName && (
          <div className="mb-4 text-sm">
            <p><span className="text-gray-500">Customer:</span> {customerName}</p>
            {customerPhone && <p><span className="text-gray-500">Phone:</span> {customerPhone}</p>}
          </div>
        )}

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="text-left pb-2">Item</th>
              <th className="text-center pb-2">Qty</th>
              <th className="text-right pb-2">Price</th>
              <th className="text-right pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className="border-b">
                <td className="py-2">{it.name}</td>
                <td className="py-2 text-center">{it.qty}</td>
                <td className="py-2 text-right">₹{it.price}</td>
                <td className="py-2 text-right">₹{it.qty * it.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-sm border-t pt-3">
          <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal}</span></div>
          {discount > 0 && <div className="flex justify-between text-blue-600"><span>Discount ({discount}%):</span><span>-₹{discountAmount.toFixed(0)}</span></div>}
          <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total:</span><span>₹{total.toFixed(0)}</span></div>
          <div className="text-center text-gray-500 text-xs mt-2">Payment: {paymentMethod.toUpperCase()}</div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => window.print()} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
            {Icons.print} Print
          </button>
          <button onClick={newSale} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {Icons.plus} New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Item Entry */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">New Sale</h1>

          {/* Search Medicine */}
          <div className="relative mb-4">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search medicine by name or generic... (start typing)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-lg"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl max-h-64 overflow-auto">
                {searchResults.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => addItem(m)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.generic} • Batch: {m.batch}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${m.qty <= 5 ? 'text-red-600' : 'text-green-600'}`}>Stock: {m.qty}</div>
                      <div className="text-xs text-gray-500">Exp: {m.expiry}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Medicine</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center mb-2">{Icons.cart}</div>
                    Search and add medicines to start billing
                  </td></tr>
                ) : (
                  items.map(it => (
                    <tr key={it.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.generic}</div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateQty(it.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition">−</button>
                          <span className="w-8 text-center font-semibold">{it.qty}</span>
                          <button onClick={() => updateQty(it.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition">+</button>
                        </div>
                      </td>
                      <td className="py-3 text-right text-gray-600">₹{it.price}</td>
                      <td className="py-3 text-right font-semibold">₹{it.qty * it.price}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => removeItem(it.id)} className="text-red-500 hover:text-red-700 transition">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: Summary & Payment */}
      <div className="space-y-4">
        {/* Customer Info (Optional) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-700 mb-3">Customer (Optional)</h3>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 mb-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-700 mb-3">Bill Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Items:</span><span>{items.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span>₹{subtotal}</span></div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Discount:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 px-2 py-1 border rounded text-center text-sm"
              />
              <span className="text-gray-500">%</span>
              {discount > 0 && <span className="text-blue-600 ml-auto">-₹{discountAmount.toFixed(0)}</span>}
            </div>

            <div className="flex justify-between font-bold text-xl pt-3 border-t">
              <span>Total:</span>
              <span className="text-slate-900">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-700 mb-3">Payment Method</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${paymentMethod === 'cash' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {Icons.cash} Cash
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${paymentMethod === 'upi' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {Icons.phone} UPI
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${paymentMethod === 'card' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {Icons.card} Card
            </button>
          </div>
        </div>

        {/* Complete Sale Button */}
        <button
          onClick={completeSale}
          disabled={items.length === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition ${items.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Complete Sale • ₹{total.toFixed(0)}
        </button>

        <button onClick={newSale} className="w-full py-2 text-gray-500 hover:text-gray-700 transition text-sm">
          Clear & Start New
        </button>
      </div>
    </div>
  );
}
