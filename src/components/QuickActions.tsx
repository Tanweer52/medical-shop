import React from 'react';
import Link from 'next/link';

const QuickActions: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/new-sale" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition">
        <span>+</span> New Sale
      </Link>
      <Link href="/add-medicine" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition">
        <span>↻</span> Add Stock
      </Link>
      <button className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white px-5 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition">
        <span>📋</span> Scan Prescription
      </button>
    </div>
  );
};

export default QuickActions;
