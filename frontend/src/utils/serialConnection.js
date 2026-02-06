// Web Serial API utilities
export class SerialConnection {
  constructor() {
    this.port = null;
    this.reader = null;
    this.isConnected = false;
    this.onData = null;
  }

  // Get previously authorized ports
  async getPreviousPorts() {
    try {
      const ports = await navigator.serial.getPorts();
      return ports;
    } catch (error) {
      console.error('Error getting previous ports:', error);
      return [];
    }
  }

  // Connect to a specific port (for auto-reconnect)
  async connectToPort(port) {
    try {
      this.port = port;
      return await this.connect();
    } catch (error) {
      console.error('Error connecting to port:', error);
      return false;
    }
  }

  // Save port info to localStorage after successful connection
  savePortInfo() {
    if (this.port) {
      const info = this.port.getInfo();
      localStorage.setItem('lastSerialPort', JSON.stringify({
        vendorId: info.usbVendorId,
        productId: info.usbProductId,
        timestamp: Date.now()
      }));
    }
  }

  // Clear saved port info
  static clearSavedPort() {
    localStorage.removeItem('lastSerialPort');
  }

  // Get saved port info
  static getSavedPortInfo() {
    const saved = localStorage.getItem('lastSerialPort');
    return saved ? JSON.parse(saved) : null;
  }

  async selectPort() {
    try {
      this.port = await navigator.serial.requestPort();
      return true;
    } catch (error) {
      console.error('Error selecting port:', error);
      return false;
    }
  }

  async connect() {
    if (!this.port) {
      console.error('No port selected');
      return false;
    }

    // Disconnect first if already connected
    if (this.isConnected) {
      await this.disconnect();
    }

    try {
      await this.port.open({ baudRate: 115200 });
      this.isConnected = true;
      this.savePortInfo(); // Save port info on successful connection
      this.startReading();
      return true;
    } catch (error) {
      console.error('Error connecting:', error);
      SerialConnection.clearSavedPort(); // Clear saved port on connection failure
      return false;
    }
  }

  async startReading() {
    try {
      while (this.port.readable && this.isConnected) {
        this.reader = this.port.readable.getReader();
        try {
          let buffer = '';
          while (true) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (!this.isConnected) break; // Check if disconnected

            // Decode the received data
            const text = new TextDecoder().decode(value);
            buffer += text;

            // Process complete JSON lines
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && trimmed.startsWith('{')) {
                try {
                  const data = JSON.parse(trimmed);
                  if (this.onData) {
                    // Pass all JSON data to handler
                    // Handler will filter for sensor data vs status messages
                    this.onData(data);
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e, trimmed);
                }
              } else if (trimmed && !trimmed.startsWith('{')) {
                // Non-JSON messages (legacy or debug output)
                console.log('Serial:', trimmed);
              }
            }
          }
        } catch (readError) {
          // Check if error is due to cancellation (normal during disconnect)
          if (this.isConnected) {
            console.error('Error during read:', readError);
          }
        } finally {
          // Always release the lock
          if (this.reader) {
            try {
              this.reader.releaseLock();
            } catch (e) {
              // Ignore errors when releasing lock
            }
          }
        }
      }
    } catch (error) {
      if (this.isConnected) {
        console.error('Error reading from port:', error);
      }
      this.isConnected = false;
    }
  }

  async disconnect() {
    // Set flag first to stop reading loop
    this.isConnected = false;
    
    // Give the read loop a moment to exit cleanly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Cancel the reader if it exists
    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
      } catch (e) {
        // Ignore errors - reader might already be released
      }
      this.reader = null;
    }
    
    // Close the port after reader is fully released
    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        console.warn('Error closing port:', e);
      }
      this.port = null;
    }
  }
}

export async function getUserAgentData() {
  // Check if Web Serial API is available
  if (!navigator.serial) {
    return false;
  }
  return true;
}
