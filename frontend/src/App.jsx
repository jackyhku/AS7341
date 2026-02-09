import React, { useState, useEffect, useRef } from 'react';
import { SerialConnection } from './utils/serialConnection';
import Chart from './components/Chart';
import DataTable from './components/DataTable';
import ControlPanel from './components/ControlPanel';
import SpectrumChart from './components/SpectrumChart';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [timePoints, setTimePoints] = useState([]);
  const [error, setError] = useState('');
  const [sampleRate, setSampleRate] = useState(1); // Default 1 Hz
  const serialRef = useRef(null);
  const dataBufferRef = useRef({
    '410nm': [],
    '440nm': [],
    '470nm': [],
    '510nm': [],
    '550nm': [],
    '580nm': [],
    '610nm': [],
    '680nm': [],
    '730nm': [],
    '810nm': [],
    '860nm': [],
    'clear': []
  });
  const timeBufferRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    serialRef.current = new SerialConnection();

    // Try to auto-reconnect to previously connected port
    const tryAutoReconnect = async () => {
      const savedPortInfo = SerialConnection.getSavedPortInfo();
      if (!savedPortInfo) return;

      try {
        const ports = await serialRef.current.getPreviousPorts();
        if (ports.length === 0) {
          SerialConnection.clearSavedPort();
          return;
        }

        // Find matching port by vendor/product ID
        const matchingPort = ports.find(port => {
          const info = port.getInfo();
          return info.usbVendorId === savedPortInfo.vendorId &&
            info.usbProductId === savedPortInfo.productId;
        });

        if (matchingPort) {
          console.log('Auto-reconnecting to previous port...');
          const connected = await serialRef.current.connectToPort(matchingPort);
          if (connected) {
            startTimeRef.current = Date.now();
            serialRef.current.onData = handleSerialData;
            setIsConnected(true);
            console.log('Auto-reconnected successfully');
          } else {
            console.log('Auto-reconnect failed');
            SerialConnection.clearSavedPort();
          }
        } else {
          // Port no longer available
          SerialConnection.clearSavedPort();
        }
      } catch (err) {
        console.error('Error during auto-reconnect:', err);
        SerialConnection.clearSavedPort();
      }
    };

    tryAutoReconnect();

    return () => {
      if (serialRef.current?.isConnected) {
        // Call async disconnect but don't await in cleanup
        serialRef.current.disconnect().catch(err => {
          console.warn('Error during disconnect cleanup:', err);
        });
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      setError('');
      const portSelected = await serialRef.current.selectPort();
      if (!portSelected) return;

      const connected = await serialRef.current.connect();
      if (!connected) {
        setError('Failed to connect to port');
        return;
      }

      startTimeRef.current = Date.now();
      serialRef.current.onData = handleSerialData;
      setIsConnected(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSerialData = (newData) => {
    // Filter out status and error messages, only process sensor data
    if (newData.status) {
      // Status message from Arduino (LED ON/OFF, rate changes)
      console.log('Arduino status:', newData.status);
      return;
    }

    if (newData.error) {
      // Error message from Arduino
      console.error('Arduino error:', newData.error);
      setError(`Sensor: ${newData.error}`);
      return;
    }

    // Must have channels property to be valid sensor data
    if (!newData.channels) {
      return;
    }

    setData(newData);

    if (newData.channels) {
      // Always keep last 60 samples (rolling/cycling buffer)
      const maxPoints = 60;

      // Add new sample to each channel and trim if needed
      Object.keys(newData.channels).forEach(channel => {
        if (!dataBufferRef.current[channel]) {
          dataBufferRef.current[channel] = [];
        }
        dataBufferRef.current[channel].push(newData.channels[channel]);

        // Remove oldest sample if buffer exceeds maxPoints
        if (dataBufferRef.current[channel].length > maxPoints) {
          dataBufferRef.current[channel].shift();
        }
      });

      // Build time points as relative time based on position in buffer
      const currentBufferLength = dataBufferRef.current['410nm'].length;
      const relativeTimePoints = [];
      for (let i = 0; i < currentBufferLength; i++) {
        const timeInSeconds = parseFloat((i / sampleRate).toFixed(1));
        relativeTimePoints.push(timeInSeconds);
      }

      // Create new copies of arrays for React to detect changes
      const newChartData = {};
      Object.keys(dataBufferRef.current).forEach(channel => {
        newChartData[channel] = [...dataBufferRef.current[channel]];
      });

      // Update chart data with new copies
      setTimePoints(relativeTimePoints);
      setChartData(newChartData);
    }
  };

  const handleDisconnect = async () => {
    if (serialRef.current?.isConnected) {
      await serialRef.current.disconnect();
    }
    // Don't clear saved port on manual disconnect - allow reconnect on reload
    setIsConnected(false);
    setData(null);
    setChartData({});
    setTimePoints([]);
    dataBufferRef.current = {
      '410nm': [],
      '440nm': [],
      '470nm': [],
      '510nm': [],
      '550nm': [],
      '580nm': [],
      '610nm': [],
      '680nm': [],
      '730nm': [],
      '810nm': [],
      '860nm': [],
      'clear': []
    };
    timeBufferRef.current = [];
  };

  const sendLEDCommand = (command) => {
    if (serialRef.current?.port?.writable) {
      const writer = serialRef.current.port.writable.getWriter();
      writer.write(new TextEncoder().encode(command));
      writer.releaseLock();
    }
  };

  const handleSampleRateChange = (rate) => {
    setSampleRate(rate);

    // Send sample rate command to Arduino
    if (serialRef.current?.port?.writable) {
      const command = `RATE:${rate}\n`;
      const writer = serialRef.current.port.writable.getWriter();
      writer.write(new TextEncoder().encode(command));
      writer.releaseLock();
    }

    // Clear data buffers to start fresh with new sample rate
    dataBufferRef.current = {
      '410nm': [],
      '440nm': [],
      '470nm': [],
      '510nm': [],
      '550nm': [],
      '580nm': [],
      '610nm': [],
      '680nm': [],
      '730nm': [],
      '810nm': [],
      '860nm': [],
      'clear': []
    };
    timeBufferRef.current = [];
    setChartData({});
    setTimePoints([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Connect Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">AS7341 Sensor Visualizer</h1>
            <p className="text-gray-400">Real-time multispectral color sensor data visualization</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${isConnected
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {isConnected && (
          <>
            {/* Control Panel */}
            <ControlPanel
              onSendCommand={sendLEDCommand}
              onSampleRateChange={handleSampleRateChange}
            />

            {/* Main Content Grid */}
            <div className="mb-6">
              {/* Current Values */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Current Values</h2>
                <DataTable data={data?.channels} />
              </div>
            </div>

            {/* Spectrum Chart */}
            <div className="mb-6">
              <SpectrumChart data={data} />
            </div>

            {/* Chart */}
            {timePoints.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Sensor Data Over Time</h2>
                <Chart data={chartData} timePoints={timePoints} />
              </div>
            )}
          </>
        )}

        {!isConnected && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Click "Connect to Serial" to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
