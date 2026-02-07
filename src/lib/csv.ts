export function exportCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSVPaste(text: string) {
  // simple split-lines, comma - for clipboard quick import
  const lines = text.trim().split(/\r?\n/).map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g,'')));
  return lines;
}
