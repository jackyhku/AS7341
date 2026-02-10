import React from 'react';

export default function TrainingStats({ logs }) {
    if (!logs || logs.length === 0) return null;

    const lastLog = logs[logs.length - 1];

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Training Progress</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-gray-400 mb-1">Loss</div>
                    <div className="text-2xl font-mono text-white">
                        {lastLog.loss.toFixed(4)}
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                        {/* Simple visual indicator descending */}
                        <div
                            className="bg-orange-500 h-full transition-all duration-300"
                            style={{ width: `${Math.min(lastLog.loss * 50, 100)}%` }}
                        />
                    </div>
                </div>

                {lastLog.acc !== undefined && (
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                        <div className="text-2xl font-mono text-white">
                            {(lastLog.acc * 100).toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-green-500 h-full transition-all duration-300"
                                style={{ width: `${lastLog.acc * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-gray-500 font-mono">
                Epoch: {logs.length}
            </div>
        </div>
    );
}
