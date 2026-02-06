import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = {
  '410nm': '#9400D3',
  '440nm': '#4B0082',
  '470nm': '#0000FF',
  '510nm': '#00FF00',
  '550nm': '#FFFF00',
  '580nm': '#FF7F00',
  '610nm': '#FF0000',
  '680nm': '#8B0000',
  '730nm': '#FFB6C1',
  '810nm': '#FFC0CB',
  '860nm': '#FFC0CB',
  'clear': '#FFFFFF'
};

export default function Chart({ data, timePoints }) {
  const chartData = {
    labels: timePoints.map(t => t + 's'),
    datasets: Object.keys(COLORS)
      .filter(key => data[key] && data[key].length > 0)
      .map(wavelength => ({
        label: wavelength,
        data: data[wavelength],
        borderColor: COLORS[wavelength],
        backgroundColor: COLORS[wavelength] + '20',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: COLORS[wavelength],
      }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 0 // Disable animations for real-time data
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          color: '#e5e7eb',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#666',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + Math.round(context.parsed.y);
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (seconds)',
          color: '#9ca3af',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
          drawBorder: true,
          borderColor: '#4b5563'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Sensor Value',
          color: '#9ca3af',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
          drawBorder: true,
          borderColor: '#4b5563'
        }
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
