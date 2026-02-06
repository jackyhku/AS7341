import React from 'react';

const WAVELENGTHS = [
  { nm: '410nm', label: 'Violet', color: 'bg-purple-900/30' },
  { nm: '440nm', label: 'Blue-Violet', color: 'bg-indigo-900/30' },
  { nm: '470nm', label: 'Blue', color: 'bg-blue-900/30' },
  { nm: '510nm', label: 'Green', color: 'bg-green-900/30' },
  { nm: '550nm', label: 'Yellow-Green', color: 'bg-yellow-900/30' },
  { nm: '580nm', label: 'Yellow', color: 'bg-yellow-800/30' },
  { nm: '610nm', label: 'Red', color: 'bg-red-900/30' },
  { nm: '680nm', label: 'Deep Red', color: 'bg-red-950/30' },
  { nm: '730nm', label: 'Near IR', color: 'bg-rose-900/30' },
  { nm: '810nm', label: 'Near IR', color: 'bg-pink-900/30' },
  { nm: '860nm', label: 'Near IR', color: 'bg-pink-950/30' },
  { nm: 'clear', label: 'Clear', color: 'bg-gray-700/30' }
];

export default function DataTable({ data }) {
  if (!data) {
    return <div className="text-gray-400">Waiting for data...</div>;
  }

  // Data is already calibrated from App.jsx, no need to apply again

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {WAVELENGTHS.map((wave) => {
        const value = data[wave.nm];
        const displayValue = value !== undefined ? Math.round(value) : '-';
        
        return (
          <div key={wave.nm} className={`${wave.color} p-3 rounded-lg border border-gray-600`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-400">{wave.label}</div>
                <div className="text-sm font-semibold text-gray-200">{wave.nm}</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {displayValue}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
