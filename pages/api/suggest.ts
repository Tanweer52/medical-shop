import { NextApiRequest, NextApiResponse } from 'next';

const suggestions = [
  { name: 'Paracetamol 500mg', generic: 'Paracetamol', category: 'Analgesic' },
  { name: 'Amoxicillin 250mg', generic: 'Amoxicillin', category: 'Antibiotic' },
  { name: 'Cetirizine 10mg', generic: 'Cetirizine', category: 'Antihistamine' },
  { name: 'Aspirin 75mg', generic: 'Aspirin', category: 'Cardiac' }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = String(req.query.q || '').toLowerCase();
  if (!q) return res.status(200).json([]);
  const out = suggestions.filter(s => s.name.toLowerCase().includes(q) || s.generic.toLowerCase().includes(q));
  res.status(200).json(out.slice(0,10));
}
