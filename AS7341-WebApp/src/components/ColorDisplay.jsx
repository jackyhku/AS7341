import React from 'react';

export default function ColorDisplay({ color, currentData }) {
  // Use RGB from color object if available, otherwise fallback
  const rgb = color.rgb || { r: 128, g: 128, b: 128 };
  const confidences = color.allConfidences || [];
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Color Confidence Levels</h2>
      
      <div className="space-y-2">
        {confidences.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            {/* Color indicator dot */}
            <div 
              className="w-7 h-7 rounded border-2 border-gray-600 flex-shrink-0 shadow-md"
              style={{ backgroundColor: item.hex }}
            ></div>
            
            {/* Color name */}
            <div className="w-20 text-sm font-semibold text-gray-300 flex-shrink-0">
              {item.name}
            </div>
            
            {/* Confidence bar */}
            <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${item.confidence}%` }}
              >
                {item.confidence > 12 && (
                  <span className="text-xs font-bold text-white drop-shadow">
                    {item.confidence.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Confidence percentage (outside bar for low values) */}
            {item.confidence <= 12 && (
              <div className="w-14 text-xs text-gray-400 text-right flex-shrink-0 font-semibold">
                {item.confidence.toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Small RGB reference at bottom */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Raw RGB: <span className="text-red-400">{rgb.r}</span>, <span className="text-green-400">{rgb.g}</span>, <span className="text-blue-400">{rgb.b}</span>
        </p>
      </div>
    </div>
  );
}

