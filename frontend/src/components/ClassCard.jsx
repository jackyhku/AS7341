import React from 'react';

export default function ClassCard({ 
  classData, 
  isActive, 
  onRecordStart, 
  onRecordStop, 
  onRename, 
  onDelete,
  disabled 
}) {
  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isActive 
        ? 'bg-gray-700 border-blue-500 shadow-lg shadow-blue-500/20' 
        : 'bg-gray-800 border-gray-700'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={classData.name}
          onChange={(e) => onRename(classData.id, e.target.value)}
          className="bg-transparent text-lg font-semibold text-white focus:outline-none focus:border-b border-blue-500 px-1 w-full mr-2"
          placeholder="Class Name"
          disabled={disabled}
        />
        {onDelete && (
          <button 
            onClick={() => onDelete(classData.id)}
            className="text-gray-500 hover:text-red-400 p-1"
            disabled={disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-gray-400 text-sm">
          {classData.samples.length} samples
        </div>

        <button
          onMouseDown={() => !disabled && onRecordStart(classData.id)}
          onMouseUp={onRecordStop}
          onMouseLeave={onRecordStop}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!disabled) onRecordStart(classData.id);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRecordStop();
          }}
          disabled={disabled}
          className={`py-3 px-4 rounded-md font-medium transition-all select-none active:scale-95 ${
            disabled 
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : isActive 
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
          }`}
        >
          {isActive ? 'Recording...' : 'Hold to Record'}
        </button>
      </div>

      {/* Mini visualization of sample count bar */}
      <div className="mt-3 w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${Math.min(classData.samples.length, 100)}%` }}
        />
      </div>
    </div>
  );
}
