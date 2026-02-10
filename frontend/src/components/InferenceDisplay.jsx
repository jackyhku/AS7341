import React from 'react';

export default function InferenceDisplay({ predictions, classes, inferenceCount }) {
    if (!predictions || predictions.length === 0) return null;

    // Find the index with the highest probability
    const maxProbIndex = predictions.indexOf(Math.max(...predictions));

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Real-time Classification</h2>
                <div className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm font-mono border border-blue-700">
                    Inference Count: <span className="text-white font-bold">{inferenceCount || 0}</span>
                </div>
            </div>

            <div className="space-y-4">
                {classes.map((cls, idx) => {
                    const probability = predictions[idx] || 0;
                    const percentage = (probability * 100).toFixed(1);
                    const isWinner = idx === maxProbIndex;

                    return (
                        <div key={cls.id} className="relative">
                            <div className="flex justify-between items-end mb-1">
                                <span className={`font-medium ${isWinner ? 'text-white' : 'text-gray-400'}`}>
                                    {cls.name}
                                </span>
                                <span className={`font-mono ${isWinner ? 'text-white' : 'text-gray-500'}`}>
                                    {percentage}%
                                </span>
                            </div>

                            <div className="w-full bg-gray-900 rounded-lg h-8 overflow-hidden relative">
                                <div
                                    className={`h-full transition-all duration-100 ease-out ${isWinner ? 'bg-blue-500' : 'bg-gray-600'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
