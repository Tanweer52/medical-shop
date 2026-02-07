import { NextApiRequest, NextApiResponse } from 'next';

const mock = [
  { id: '1', name: 'Paracetamol 500mg', generic: 'Paracetamol', batch: 'A1', rack: 'A1', qty: 5, expiry: '2026-02-15' },
  { id: '2', name: 'Amoxicillin 250mg', generic: 'Amoxicillin', batch: 'B2', rack: 'B1', qty: 0, expiry: '2024-12-01' },
  { id: '3', name: 'Cetirizine 10mg', generic: 'Cetirizine', batch: 'C3', rack: 'A2', qty: 50, expiry: '2026-08-10' },
  { id: '4', name: 'Aspirin 75mg', generic: 'Aspirin', batch: 'D4', rack: 'B2', qty: 2, expiry: '2026-01-20' }
];

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000*60*60*24));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = String(req.query.q || '').toLowerCase();
  if (req.method === 'GET' && req.query.q) {
    const results = mock.filter(m => m.name.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.batch.toLowerCase().includes(q) || m.rack.toLowerCase().includes(q));
    return res.status(200).json(results);
  }

  if (req.method === 'GET' && req.url?.includes('/summary')) {
    const lowStock = mock.filter(m => m.qty <= 5).length;
    const expiring = mock.filter(m => daysUntil(m.expiry) <= 60 && daysUntil(m.expiry) >= 0).length;
    const pending = 2; // mock

    const urgent = mock.map(m => {
      const days = daysUntil(m.expiry);
      const status = m.qty <= 0 ? 'red' : days < 0 ? 'red' : days <= 30 || m.qty <=5 ? 'yellow' : 'green';
      return { ...m, status };
    }).sort((a,b) => (a.status === 'red' ? -1 : 1));

    const restock = mock.map(m => ({ id: m.id, name: m.name, qty: m.qty, expiry: m.expiry, suggested: Math.max(0, 20 - m.qty), status: m.qty<=0 ? 'red' : daysUntil(m.expiry)<=30 ? 'yellow' : 'green' }));

    return res.status(200).json({ lowStockCount: lowStock, expiringCount: expiring, pendingPrescriptions: pending, urgent, restock });
  }

  return res.status(200).json(mock);
}
