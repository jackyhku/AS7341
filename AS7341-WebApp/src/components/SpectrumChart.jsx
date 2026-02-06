import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SpectrumChart({ data }) {
  const chartRef = useRef(null);

  if (!data || !data.channels) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Spectral Distribution</h2>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  // Data is already calibrated from App.jsx, no need to apply again
  const displayChannels = data.channels;

  // Spectrum data mapping (excluding 'clear' channel for spectrum)
  // Colors match the time-series chart for consistency
  const spectrumChannels = [
    { wavelength: '410nm', freq: 410, color: '#9400D3' },  // Violet
    { wavelength: '440nm', freq: 440, color: '#4B0082' },  // Indigo
    { wavelength: '470nm', freq: 470, color: '#0000FF' },  // Blue
    { wavelength: '510nm', freq: 510, color: '#00FF00' },  // Green
    { wavelength: '550nm', freq: 550, color: '#FFFF00' },  // Yellow
    { wavelength: '580nm', freq: 580, color: '#FF7F00' },  // Orange
    { wavelength: '610nm', freq: 610, color: '#FF0000' },  // Red
    { wavelength: '680nm', freq: 680, color: '#8B0000' },  // Dark Red
    { wavelength: '730nm', freq: 730, color: '#FFB6C1' },  // Light Pink (NIR)
    { wavelength: '810nm', freq: 810, color: '#FFC0CB' },  // Pink (NIR)
    { wavelength: '860nm', freq: 860, color: '#FFC0CB' },  // Pink (NIR)
  ];

  const chartData = {
    labels: spectrumChannels.map(ch => ch.freq + 'nm'),
    datasets: [{
      label: 'Intensity',
      data: spectrumChannels.map(ch => displayChannels[ch.wavelength] || 0),
      backgroundColor: spectrumChannels.map(ch => ch.color),
      borderColor: spectrumChannels.map(ch => ch.color),
      borderWidth: 2,
      barPercentage: 0.95,
      categoryPercentage: 0.95,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#444',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Intensity: ${context.parsed.y.toFixed(0)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Wavelength (nm)',
          color: '#D1D5DB',
          font: {
            size: 13,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Intensity (ADC)',
          color: '#D1D5DB',
          font: {
            size: 13,
            weight: 'bold'
          }
        }
      }
    },
    animation: {
      duration: 0 // Disable animation for real-time updates
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Spectral Distribution</h2>
      <div style={{ height: '300px' }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
