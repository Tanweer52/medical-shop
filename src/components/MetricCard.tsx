import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, hint, accent = 'bg-blue-500' }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-1 h-14 rounded-full ${accent}`}></div>
      <div>
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {hint && <div className="text-xs text-gray-400">{hint}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
