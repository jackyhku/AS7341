# AS7341 Sensor Visualizer - User Guide

## Overview

This web application provides real-time visualization and color detection for the AS7341 11-channel spectral sensor. It features scientifically accurate color conversion using CIE 1931 color matching functions and includes essential white balance calibration.

---

## Key Features

### 1. Real-Time Data Visualization
- Live chart displaying spectral data across all wavelengths (410nm - 860nm)
- Rolling window of last 60 samples
- Adjustable sample rates from 0.25 Hz to 8 Hz

### 2. Accurate Color Detection
- **CIE 1931 Color Space Conversion**: Spectral data → XYZ → sRGB pipeline
- **White Balance Calibration**: Normalize readings for lighting-independent color detection
- **Confidence Scoring**: Saturation-based confidence metric (0-100%)
- **RGB Display**: Real-time RGB values derived from spectral measurements

### 3. LED Control
- Toggle integrated LED for reflectance measurements
- Turn off LED to measure ambient light only

---

## Getting Started

### Initial Setup

1. **Connect to Sensor**
   - Click the **"Connect"** button in the top-right corner
   - Select your Arduino serial port from the browser dialog
   - Status indicator will turn green when connected

2. **Configure Sample Rate**
   - Select desired sampling frequency from dropdown (default: 1 Hz)
   - Options: 0.25 Hz, 0.5 Hz, 1 Hz, 2 Hz, 4 Hz, 8 Hz
   - Higher rates = more responsive, lower rates = longer visible history

3. **Turn on LED**
   - Click **"LED ON"** to enable the integrated LED
   - Recommended for measuring colored objects
   - Turn off to measure ambient/transmitted light

---

## Color Calibration (ESSENTIAL for Accurate Colors)

### Why Calibration is Necessary

The AS7341 sensor measures **absolute spectral intensity** at each wavelength. Without calibration:
- Same color appears different under different lighting
- Sensor manufacturing variations affect readings
- White balance shifts all color perception

### How to Calibrate

**⚠️ Perform calibration whenever:**
- First using the application
- Lighting conditions change
- Moving to a new environment
- Colors appear consistently incorrect

**Calibration Steps:**

1. **Prepare White Reference**
   - Use a pure white surface (white paper, white wall, white card)
   - Ensure surface is evenly lit
   - Avoid shadows or glossy surfaces

2. **Position Sensor**
   - Turn **LED ON**
   - Point sensor directly at white surface
   - Maintain consistent distance (~1-3 cm works well)
   - Ensure stable positioning

3. **Calibrate**
   - Wait for readings to stabilize (1-2 seconds)
   - Click **"Calibrate"** button
   - Green feedback message confirms calibration
   - **Green indicator dot** appears next to "Calibration:" label
   - All subsequent readings now normalized to this white reference

4. **Save Calibration (Important!)**
   - Click **"Save"** button to persist calibration to browser storage
   - Calibration will now survive page reloads and browser restarts
   - Saved calibration automatically loads when you return to the app
   - Without saving, calibration is lost when page is closed/refreshed

5. **Verify**
   - Keep pointing at white surface
   - Detected color should show "White" with high confidence
   - RGB values should be balanced (similar R, G, B values)

### Calibration Persistence

**What Gets Saved:**
- Spectral readings for all 11 channels from your white reference
- Stored in browser's localStorage (permanent until cleared)

**Calibration Status Indicator:**
- **Green dot visible**: Calibration is active (either just calibrated or loaded from storage)
- **No dot**: No calibration active - colors will be inaccurate

**When Calibration is Lost:**
- If you don't click "Save" - lost on page refresh
- If you clear browser data/cookies
- If you use a different browser or device
- If you click "Reset" button

### Reset Calibration

Click **"Reset"** button to:
- Clear current calibration from memory
- Remove saved calibration from browser storage
- Return to uncalibrated state
- Use when you want to recalibrate from scratch

### What Does Calibration Data Look Like?

The calibration stores a snapshot of all sensor readings from your white reference:

```json
{
  "410nm": 1234,
  "440nm": 1567,
  "470nm": 1890,
  "510nm": 2345,
  "550nm": 2678,
  "580nm": 2890,
  "610nm": 2456,
  "680nm": 2123,
  "730nm": 1890,
  "810nm": 1567,
  "860nm": 1234,
  "clear": 3456
}
```

**These values represent:**
- Raw ADC readings (0-65535 range) from each spectral channel
- Captured when you clicked "Calibrate" while pointing at white surface
- Used as divisor to normalize all future readings (ratio calculation)

**Example of normalization:**
- If white reference at 550nm was 2000
- Current reading at 550nm is 1000
- Normalized value = 1000 / 2000 = 0.5 (50% of white reference)

This makes color detection independent of:
- Overall brightness
- LED intensity
- Distance from object
- Ambient lighting conditions

---

## Quick Reference - Control Panel Buttons

### LED Control
- **ON**: Enable integrated LED for reflectance measurements
- **OFF**: Disable LED for ambient light measurements

### Sample Rate
- Dropdown menu: 0.25 Hz to 8 Hz
- Controls how frequently sensor reads data
- Higher = faster updates, shorter visible history

### Calibration Controls

**Calibrate**
- Captures current reading as white reference
- Point at white surface before clicking
- Must be connected and receiving data
- Calibration stored in memory (temporary until saved)

**Save**
- Saves current calibration to browser localStorage
- Makes calibration permanent (survives reloads/reboots)
- Only works if calibration exists
- Shows "Calibration saved successfully!" on success

**Reset**
- Clears calibration from memory AND storage
- Returns to uncalibrated state
- Use before recalibrating or if results seem wrong
- Green indicator dot disappears

**Status Indicator**
- Green dot = Calibration active
- No dot = No calibration (uncalibrated state)

---

## Measuring Colors

### For Best Results

1. **Consistent Distance**: Keep sensor same distance from all objects
2. **Stable Lighting**: Avoid moving shadows or changing light sources
3. **LED Control**:
   - **LED ON**: Measure opaque colored objects (reflectance mode)
   - **LED OFF**: Measure ambient light or transparent/translucent materials
4. **Surface Type**: Matte surfaces work better than glossy/reflective surfaces

### Understanding the Display

**Color Preview Box**
- Shows actual detected color with visual glow effect
- Updates in real-time as sensor reads new data

**Color Name & Hex**
- Detected color name (Red, Blue, Green, etc.)
- Hex color code for web/design use

**Confidence Meter**
- 0-100% confidence score
- Based on color saturation (purity)
- Higher = more saturated/pure color
- Lower = grayish/desaturated color

**RGB Values**
- Red, Green, Blue components (0-255)
- Calculated using CIE color matching functions
- Matches standard sRGB color space

---

## Chart Controls

### Rolling Window Display
- Chart shows **last 60 data samples** only
- Older data automatically removed as new data arrives
- Time axis shows relative time (0s to max seconds based on sample rate)

### Sample Rate Impact on Chart
| Sample Rate | 60 Samples = | Use Case |
|-------------|--------------|----------|
| 0.25 Hz     | 4 minutes    | Long-term monitoring |
| 0.5 Hz      | 2 minutes    | General use |
| 1 Hz        | 1 minute     | Standard monitoring |
| 2 Hz        | 30 seconds   | Quick changes |
| 4 Hz        | 15 seconds   | Fast response |
| 8 Hz        | 7.5 seconds  | Rapid changes |

---

## Supported Colors

The color detection algorithm can identify:

- **Primary Colors**: Red, Green, Blue
- **Secondary Colors**: Yellow, Cyan, Magenta
- **Blended Colors**: Orange, Yellow-Green
- **Neutrals**: White, Gray, Dark Gray, Black

### Color Detection Method

1. **Spectral to XYZ Conversion**
   - Each wavelength weighted by CIE 1931 color matching functions
   - Produces XYZ tristimulus values (how humans perceive color)

2. **XYZ to sRGB Conversion**
   - Standard D65 illuminant transformation matrix
   - Gamma correction for display accuracy (sRGB standard)
   - Normalization to 0-255 RGB range

3. **Color Classification**
   - RGB ratios determine hue
   - Saturation determines confidence
   - Brightness determines white/gray/black

---

## Technical Specifications

### AS7341 Wavelength Channels
- 410nm (Violet)
- 440nm (Blue-Violet)
- 470nm (Blue)
- 510nm (Green)
- 550nm (Yellow-Green)
- 580nm (Yellow)
- 610nm (Red)
- 680nm (Deep Red)
- 730nm (Near-IR)
- 810nm (Near-IR)
- Clear (No filter)

### Color Space Conversions
- **Input**: 11-channel spectral power distribution
- **Processing**: CIE 1931 2° standard observer functions
- **Output**: sRGB (D65 white point) with gamma 2.2

---

## Troubleshooting

### Colors are Inaccurate
**Solution**: Recalibrate white balance
- Ensure white reference is truly white
- Check LED is on during calibration
- Verify consistent lighting
- **Click "Save" after calibrating** to persist

### Calibration Lost After Reload
**Cause**: Did not save calibration
**Solution**:
- Calibrate pointing at white surface
- Click **"Save"** button (not just "Calibrate")
- Verify green dot indicator remains after page refresh

### "No calibration to save" Message
**Cause**: Haven't calibrated yet
**Solution**:
- Click "Calibrate" first while pointing at white
- Wait for success message
- Then click "Save"

### Chart Data Disappears
**Solution**: Check sample rate setting
- Data cycles every 60 samples
- Lower sample rate = longer visible history
- Refresh browser if issue persists

### Sensor Not Connecting
**Check**:
- Arduino is connected via USB
- Correct COM port selected
- Browser supports Web Serial API (Chrome, Edge)
- No other application using the serial port

### LED Not Responding
**Verify**:
- Physical sensor connection to Arduino
- Arduino code uploaded correctly
- Serial communication active (green status indicator)

### Low Confidence Scores
**This is normal for**:
- Gray/neutral colors (low saturation)
- Mixed/complex colors
- Low light conditions
- Shiny/reflective surfaces

---

## Best Practices

### For Scientific/Accurate Measurements
1. Use controlled lighting environment
2. Calibrate before each session
3. Keep sensor perpendicular to surface
4. Use matte white reference (99% reflectance standard if available)
5. Record calibration conditions for reproducibility

### For General Use
1. Calibrate once at startup
2. Re-calibrate if results seem off
3. Use consistent technique (distance, angle)
4. LED on for most color measurements

### For Color Matching
1. Calibrate with same white reference
2. Measure reference color with LED on
3. Measure target color with same LED setting
4. Compare RGB values or hex codes

---

## Data Export

**Chart Data**: Visual reference only (no export function currently)

**RGB Values**: Displayed in real-time
- Copy hex code for digital use
- Note R, G, B values for analysis

**Spectral Data**: View in "Current Values" table
- All 11 channels shown
- Raw ADC values

---

## Limitations

- **Glossy Surfaces**: May cause specular reflection artifacts
- **Fluorescent Materials**: May show unexpected spectral signatures
- **Metameric Colors**: Same RGB may have different spectral signatures
- **Ambient Light**: Strong ambient light affects LED-on measurements
- **Temperature**: Sensor performance may vary with temperature

---

## Version Information

**Application**: AS7341 Sensor Visualizer  
**Color Algorithm**: CIE 1931 2° Standard Observer  
**Color Space**: sRGB (D65)  
**Calibration**: White balance normalization  
**Communication**: Web Serial API (115200 baud)

---

## Support & Resources

- [AS7341 Datasheet](https://ams-osram.com/products/sensors/spectral-sensors/ams-as7341)
- [Adafruit AS7341 Guide](https://learn.adafruit.com/adafruit-as7341-10-channel-light-color-sensor-breakout)
- CIE 1931 Color Matching Functions
- sRGB Color Space Specification

---

**Last Updated**: February 6, 2026
