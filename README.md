# AS7341 Multispectral Sensor Visualizer

Real-time visualization system for the AS7341 11-channel multispectral color sensor. This project combines Arduino firmware with a modern web application to provide live spectral data analysis and visualization through a browser-based interface.

## 🌈 Features

### Web Application
- **Real-time Data Visualization**: Live streaming of 11 spectral channels (410nm - 860nm) plus clear channel
- **Dual Chart Display**: 
  - Time-series line chart with 60-sample rolling window
  - Spectral distribution bar chart
- **Dynamic Sample Rate Control**: Adjustable sampling rates (0.25 Hz to 8 Hz)
- **Auto-Reconnect**: Remembers last connected COM port and automatically reconnects on page reload
- **Hardware-Level Noise Reduction**: 5x internal oversampling on Arduino for stable readings
- **LED Control**: Toggle AS7341 onboard LED directly from the web interface
- **Web Firmware Flasher**: Flash Arduino firmware directly from the browser (no external tools required)
- **Modern UI**: Clean, dark-themed interface built with React and TailwindCSS

### Arduino Firmware
- **Multi-Rate Sampling**: Synchronized sample rate control (0.25-8 Hz)
- **Oversampling**: Takes 5 readings per transmission and averages them for reduced noise
- **JSON Communication Protocol**: Structured data format for reliability
- **Memory-Safe**: Uses char arrays instead of String objects to prevent heap fragmentation
- **Status Reporting**: Informative error and status messages

## 📋 Hardware Requirements

- **Microcontroller**: Arduino Mega 2560 (or compatible)
- **Sensor**: Adafruit AS7341 11-channel multispectral color sensor
- **Connection**: I2C interface
- **USB Cable**: For serial communication with computer

## 💻 Software Requirements

### Arduino Development
- PlatformIO (recommended) or Arduino IDE
- Libraries:
  - Adafruit_AS7341
  - Wire (I2C)

### Web Application
- Node.js 16+ and npm
- Modern web browser with Web Serial API support (Chrome, Edge, Opera)
- **Firmware Flashing**: Requires a browser that supports WebUSB (Chrome, Edge)

## 🚀 Installation

### 1. Arduino Firmware Setup

**Method 1: Direct Web Flashing (Recommended)**
1. Connect your Arduino Mega to your computer via USB.
2. Ensure no other applications (like Arduino IDE or Serial Monitor) are using the port.
3. Open the web application (see Web Application Setup below).
4. Use the "Firmware Update" section to flash the latest bundled firmware directly to your board.

**Method 2: Manual PlatformIO Upload**
```bash
# Navigate to Arduino project
cd arduino

# Using PlatformIO CLI
pio run --target upload

# Or open in PlatformIO IDE and upload
```

**Hardware Connections:**
- Connect AS7341 to Arduino I2C pins (SDA, SCL)
- Connect power (3.3V or 5V depending on breakout board)
- Connect GND

### 2. Web Application Setup

```bash
# Navigate to web app directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Usage

1. **Upload Arduino Firmware**: Flash the firmware to your Arduino Mega 2560
2. **Connect Hardware**: Connect the AS7341 sensor to the Arduino via I2C
3. **Start Web Application**: Run `npm run dev` in the frontend directory
4. **Connect to Sensor**:
   - Click "Connect" button in the web interface
   - Select the Arduino's COM port from the browser dialog
   - Connection status will turn green when successful
5. **Visualize Data**: Watch real-time spectral data in both chart views
6. **Adjust Settings**:
   - Change sample rate using the dropdown (0.25 Hz - 8 Hz)
   - Toggle LED on/off using the control buttons
7. **Update Firmware (if needed)**:
   - If you need to update the firmware, locate the "Firmware Update" box.
   - Ensure the "Connect" button at the top is **disconnected**.
   - Click "Update Firmware" and follow the instructions.

### Auto-Reconnect Feature
After the first successful connection, the web app remembers your device. Simply refresh the page and it will automatically reconnect to the same COM port.

## 📁 Project Structure

```
arduino/                         # Arduino firmware project
├── platformio.ini              # PlatformIO configuration
└── src/
    └── main.cpp                # Arduino firmware with oversampling

frontend/                        # React-based web application
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
└── src/
    ├── App.jsx                 # Main application component
    ├── main.jsx                # Entry point
    ├── index.css               # Global styles
    ├── components/
    │   ├── Chart.jsx           # Time-series line chart
    │   ├── SpectrumChart.jsx   # Spectral distribution bar chart
    │   ├── DataTable.jsx       # Current sensor values display
    │   └── ControlPanel.jsx    # LED and sample rate controls
    └── utils/
        ├── serialConnection.js # Web Serial API wrapper with auto-reconnect
        └── colorDetection.js   # Color analysis utilities

Bluetooth/                       # Bluetooth project (separate)
```

## 🔧 Technical Details

### Spectral Channels
The AS7341 sensor provides 11 discrete spectral channels:
- **Visible Spectrum**: 410nm, 440nm, 470nm, 510nm, 550nm, 580nm, 610nm, 680nm
- **Near-Infrared**: 730nm, 810nm, 860nm
- **Clear Channel**: Broadband light sensor

### Sample Rates
- **0.25 Hz**: 1 reading every 4 seconds (5 sensor reads averaged)
- **0.5 Hz**: 1 reading every 2 seconds (5 sensor reads averaged)
- **1 Hz**: 1 reading per second (5 sensor reads averaged)
- **2 Hz**: 2 readings per second (5 sensor reads averaged)
- **4 Hz**: 4 readings per second (5 sensor reads averaged)
- **8 Hz**: 8 readings per second (5 sensor reads averaged)

### Communication Protocol
- **Baud Rate**: 115200
- **Format**: JSON messages
- **Sensor Data**: `{"timestamp":123456,"channels":{"410nm":1234,...}}`
- **Status Messages**: `{"status":"LED ON"}`
- **Error Messages**: `{"error":"Failed to read sensor"}`

## 🛠️ Development

### Building for Production

```bash
cd frontend
npm run build
```

The production build will be in the `dist/` directory.

### Deploying to Vercel

#### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to web app directory
cd frontend

# Deploy
vercel
```

#### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your `AS7341` repository
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

**Important Notes for Web Serial API:**
- Web Serial API requires a secure context (HTTPS)
- Vercel automatically provides HTTPS for all deployments
- The browser will prompt for device permissions on first connection
- Users must use a Chromium-based browser (Chrome, Edge, Opera)

### Technologies Used
- **Frontend**: React 18, Vite, TailwindCSS
- **Visualization**: Chart.js
- **Communication**: Web Serial API
- **Firmware Flashing**: avrgirl-arduino (WebUSB)
- **Firmware**: Arduino C++, Adafruit AS7341 library

## 🔍 Troubleshooting

**Web Serial API not available:**
- Use a Chromium-based browser (Chrome, Edge, Opera)
- Ensure HTTPS or localhost (Web Serial requires secure context)

**Cannot connect to Arduino:**
- Check USB cable connection
- Verify correct COM port selected
- Ensure no other application is using the serial port
- Try manual disconnect/reconnect

**Firmware update fails:**
- Ensure the main "Connect" button is set to **Disconnected** (Serial port cannot be open while flashing).
- Use a WebUSB-compatible browser (Chrome/Edge).
- Check USB cable connections.

**Sensor reads as all zeros:**
- Check I2C connections (SDA, SCL, power, ground)
- Verify sensor power supply (3.3V or 5V depending on breakout)
- Check sensor orientation and ambient light levels

**Auto-reconnect not working:**
- Clear browser localStorage and try fresh connection
- Re-authorize the device in browser settings

## 📄 License

This project is open-source and available for educational and personal use.

## 👤 Author

**jackyhku**
- GitHub: [@jackyhku](https://github.com/jackyhku)

## 🙏 Acknowledgments

- Adafruit for the AS7341 sensor and library
- Web Serial API specification team
- Open-source community

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**
