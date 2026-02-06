import React, { useState } from 'react';

export default function ControlPanel({ onSendCommand, onSampleRateChange }) {
  const [feedback, setFeedback] = useState('');
  const [sampleRate, setSampleRate] = useState(1);

  const handleLEDCommand = (command) => {
    onSendCommand(command);
    setFeedback(`LED ${command === '1' ? 'ON' : 'OFF'}`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSampleRateChange = (rate) => {
    setSampleRate(Number(rate));
    onSampleRateChange(Number(rate));
    setFeedback(`Rate: ${rate} Hz`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-6">
        {/* LED Control */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-300">LED:</span>
          <button
            onClick={() => handleLEDCommand('1')}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            ON
          </button>
          <button
            onClick={() => handleLEDCommand('0')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            OFF
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* Sample Rate Control */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-300">Sample Rate:</span>
          <select
            value={sampleRate}
            onChange={(e) => handleSampleRateChange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm font-semibold hover:bg-gray-600 transition-colors focus:outline-none focus:border-blue-500"
          >
            <option value={0.25}>0.25 Hz</option>
            <option value={0.5}>0.5 Hz</option>
            <option value={1}>1 Hz</option>
            <option value={2}>2 Hz</option>
            <option value={4}>4 Hz</option>
            <option value={8}>8 Hz</option>
          </select>
        </div>

        {/* Feedback */}
        {feedback && (
          <span className="text-green-400 text-sm font-semibold ml-auto">{feedback}</span>
        )}
      </div>
    </div>
  );
}
