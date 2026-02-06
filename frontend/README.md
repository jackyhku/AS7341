# AS7341 Sensor Web Visualizer

A modern web application for visualizing real-time multispectral color sensor data from the AS7341 sensor using the Web Serial API.

## Features

✨ **Real-time Data Visualization**
- Live line charts showing all 12 sensor channels over time
- Color-coded wavelength display (410nm to 860nm)
- Current sensor values in an easy-to-read grid

🎨 **Intelligent Color Detection**
- Automatic color identification based on spectral data
- RGB value conversion from spectral readings
- Confidence level indicator

💡 **LED Control**
- Toggle the built-in sensor LED from the web interface
- Perfect for reflectance vs ambient light measurements

🎯 **Modern UI**
- Built with React and Tailwind CSS
- Dark theme optimized for sensor monitoring
- Responsive design for desktop viewing

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Chrome/Chromium** browser (Web Serial API support required)
- **Arduino Mega 2560** with AS7341 sensor connected
- **Modified Arduino firmware** with JSON serial output (see below)

## Arduino Setup

The Arduino code needs to output data in JSON format. Modify your `main.cpp` to use:

```cpp
Serial.print("{\"timestamp\":");
Serial.print(millis());
Serial.print(",\"channels\":{\"410nm\":");
Serial.print(readings[0]);
// ... continue for all channels ...
Serial.println("}}");
```

See the included Arduino project for the complete implementation.

## Installation & Setup

### 1. Install Dependencies

```bash
cd AS7341-WebApp
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will automatically open in your default browser at `http://localhost:5173`

### 3. Connect to Your Arduino

1. Click the **"Connect to Serial"** button
2. Select your Arduino Mega 2560 from the port list
3. The app will automatically start receiving and displaying sensor data

## Usage

### Viewing Sensor Data

Once connected:
- **Left Panel**: Shows detected color with RGB values and confidence level
- **Right Panel**: Displays all 12 current sensor readings
- **Bottom Chart**: Real-time line graph of all sensor channels over the last 60 data points

### Controlling the LED

- **LED ON**: Enable the sensor's built-in LED for reflectance measurements
- **LED OFF**: Disable the LED for ambient light measurements

### Understanding the Chart

Each wavelength is color-coded:
- **410nm (Violet)** - `#9400D3`
- **470nm (Blue)** - `#0000FF`
- **510nm (Green)** - `#00FF00`
- **550nm (Yellow-Green)** - `#FFFF00`
- **610nm (Red)** - `#FF0000`
- **730-860nm (Near IR)** - Pink/Rose shades

X-axis shows time in seconds, Y-axis shows raw sensor values.

## Color Detection Algorithm

The app uses spectral analysis to identify colors:

1. **Normalizes** all channel readings relative to total intensity
2. **Compares** dominant wavelengths to determine base color
3. **Assigns confidence** based on spectral distribution strength
4. **Maps** spectral data to approximate RGB values for display

The algorithm handles:
- Pure colors (red, green, blue, yellow, etc.)
- Mixed colors (orange, cyan, purple, pink, etc.)
- Achromatic colors (white, gray)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Troubleshooting

### "No ports available" when connecting
- Check USB connection to Arduino
- Install Arduino CH340 drivers if needed
- Try a different USB port

### Data not updating
- Verify Arduino is sending JSON format data
- Check baud rate is 115200
- Open browser console (F12) to see any errors

### Color detection seems off
- The algorithm works best with well-lit samples
- Try different LED settings for better results
- RGB values are approximations - spectral data is more accurate

### Web Serial API not available
- Web Serial API only works in Chrome/Chromium browsers
- HTTPS is required (except for localhost)
- Some platforms don't support Web Serial API

## Project Structure

```
AS7341-WebApp/
├── src/
│   ├── components/
│   │   ├── Chart.jsx           # Line chart visualization
│   │   ├── ColorDisplay.jsx    # Color detection display
│   │   ├── DataTable.jsx       # Sensor values grid
│   │   └── ControlPanel.jsx    # LED control buttons
│   ├── utils/
│   │   ├── colorDetection.js   # Color identification algorithm
│   │   └── serialConnection.js # Web Serial API wrapper
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind styles
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── postcss.config.js           # PostCSS configuration
```

## Technologies Used

- **React** - UI framework
- **Vite** - Fast build tool and dev server
- **Chart.js** - Data visualization
- **Tailwind CSS** - Utility-first CSS framework
- **Web Serial API** - USB communication with Arduino

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Web Serial API supported |
| Edge | ✅ Full | Chromium-based |
| Firefox | ❌ No | No Web Serial API support |
| Safari | ❌ No | No Web Serial API support |

## Tips & Tricks

1. **Calibration**: Keep a white surface nearby for reference measurements
2. **Consistency**: Keep the same distance and angle between samples
3. **Lighting**: Use consistent ambient lighting during measurements
4. **LED Settings**: Turn LED on for solid objects, off for light sources
5. **Chart Zoom**: The chart keeps the last 60 readings visible

## License

This project is open source and available for educational and commercial use.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Arduino code for proper JSON output
3. Test with sample colors to verify color detection
4. Check browser console for error messages

---

**Happy color sensing! 🌈**
