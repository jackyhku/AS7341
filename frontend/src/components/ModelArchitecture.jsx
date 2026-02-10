import React from 'react';

const INPUTS = [
    { label: '410nm', color: '#7600ed' },
    { label: '440nm', color: '#0028ff' },
    { label: '470nm', color: '#00d5ff' },
    { label: '510nm', color: '#1aff00' },
    { label: '550nm', color: '#bfff00' },
    { label: '580nm', color: '#ffdf00' },
    { label: '610nm', color: '#ff7b00' },
    { label: '680nm', color: '#ff0000' },
    { label: '730nm', color: '#9e0000' },
    { label: '810nm', color: '#570000' },
    { label: '860nm', color: '#3d0000' },
    { label: 'Clear', color: '#ffffff' },
];

const HIDDEN_UNITS = 16;

export default function ModelArchitecture({ classes }) {
    const width = 600;
    const height = 400;
    const padding = 40;

    const layerX = {
        input: padding + 50,
        hidden: width / 2,
        output: width - (padding + 50)
    };

    const getY = (index, total) => {
        const availableHeight = height - (padding * 2);
        const step = availableHeight / Math.max(total - 1, 1);
        const startY = padding + (availableHeight - (step * (total - 1))) / 2;
        return startY + (index * step);
    };

    const inputPositions = INPUTS.map((_, i) => ({ x: layerX.input, y: getY(i, INPUTS.length) }));
    const hiddenPositions = Array.from({ length: HIDDEN_UNITS }).map((_, i) => ({ x: layerX.hidden, y: getY(i, HIDDEN_UNITS) }));
    const outputPositions = classes.map((_, i) => ({ x: layerX.output, y: getY(i, classes.length) }));

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-4">Model Architecture (12-16-{classes.length})</h3>
            <div className="flex justify-center">
                <svg width={width} height={height} className="max-w-full">
                    <defs>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#4b5563" />
                        </marker>
                    </defs>

                    {/* Connections: Input -> Hidden */}
                    <g className="opacity-20">
                        {inputPositions.map((inPos, i) =>
                            hiddenPositions.map((hPos, j) => (
                                <line
                                    key={`i${i}-h${j}`}
                                    x1={inPos.x}
                                    y1={inPos.y}
                                    x2={hPos.x}
                                    y2={hPos.y}
                                    stroke="#4b5563"
                                    strokeWidth="1"
                                />
                            ))
                        )}
                    </g>

                    {/* Connections: Hidden -> Output */}
                    <g className="opacity-40">
                        {hiddenPositions.map((hPos, i) =>
                            outputPositions.map((outPos, j) => (
                                <line
                                    key={`h${i}-o${j}`}
                                    x1={hPos.x}
                                    y1={hPos.y}
                                    x2={outPos.x}
                                    y2={outPos.y}
                                    stroke="#60a5fa"
                                    strokeWidth="1.5"
                                />
                            ))
                        )}
                    </g>

                    {/* Nodes: Input */}
                    {inputPositions.map((pos, i) => (
                        <g key={`in-${i}`}>
                            <circle cx={pos.x} cy={pos.y} r="6" fill={INPUTS[i].color} stroke="#333" strokeWidth="1" />
                            <text x={pos.x - 15} y={pos.y + 4} textAnchor="end" fill="#9ca3af" fontSize="10" fontFamily="monospace">
                                {INPUTS[i].label}
                            </text>
                        </g>
                    ))}

                    {/* Nodes: Hidden */}
                    {hiddenPositions.map((pos, i) => (
                        <circle key={`hid-${i}`} cx={pos.x} cy={pos.y} r="5" fill="#10b981" />
                    ))}
                    <text x={layerX.hidden} y={padding - 15} textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">
                        Dense (ReLU, 16)
                    </text>

                    {/* Nodes: Output */}
                    {outputPositions.map((pos, i) => (
                        <g key={`out-${i}`}>
                            <circle cx={pos.x} cy={pos.y} r="8" fill="#3b82f6" />
                            <text x={pos.x + 15} y={pos.y + 4} textAnchor="start" fill="#white" fontSize="12" fontWeight="bold">
                                {classes[i].name}
                            </text>
                        </g>
                    ))}
                    <text x={layerX.output} y={padding - 15} textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
                        Output (Softmax)
                    </text>

                    {/* Layer Labels */}
                    <text x={layerX.input} y={height - 10} textAnchor="middle" fill="#6b7280" fontSize="11">Input Layer (12)</text>
                    <text x={layerX.hidden} y={height - 10} textAnchor="middle" fill="#6b7280" fontSize="11">Hidden Layer (16)</text>
                    <text x={layerX.output} y={height - 10} textAnchor="middle" fill="#6b7280" fontSize="11">Output Layer ({classes.length})</text>
                </svg>
            </div>
        </div>
    );
}
