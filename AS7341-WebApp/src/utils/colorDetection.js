// CIE 1931 2-degree color matching functions approximation for AS7341 wavelengths
// Based on standard observer data - these convert spectral power to XYZ tristimulus values
const CIE_MATCHING_FUNCTIONS = {
  // Wavelength: [X, Y, Z] matching values
  '410nm': [0.3362, 0.0382, 1.7721],
  '440nm': [0.3483, 0.0380, 1.7726],
  '470nm': [0.1421, 0.0600, 0.6791],
  '510nm': [0.0049, 0.3230, 0.2720],
  '550nm': [0.3362, 0.9950, 0.0203],
  '580nm': [0.9786, 0.8700, 0.0017],
  '610nm': [1.0263, 0.6310, 0.0000],
  '680nm': [0.2835, 0.1070, 0.0000],
  '730nm': [0.0741, 0.0298, 0.0000],
  '810nm': [0.0096, 0.0039, 0.0000]
};

// Calibration: Store white reference for normalization
let whiteReference = null;

// Load calibration from localStorage on module load
const loadCalibrationFromStorage = () => {
  try {
    const saved = localStorage.getItem('as7341_calibration');
    if (saved) {
      whiteReference = JSON.parse(saved);
      return true;
    }
  } catch (e) {
    console.error('Failed to load calibration:', e);
  }
  return false;
};

// Auto-load calibration when module loads
loadCalibrationFromStorage();

export function calibrateWhiteBalance(channels) {
  // Store current reading as white reference
  whiteReference = { ...channels };
  console.log('✅ Calibration baseline set');
  return whiteReference;
}

export function saveCalibration() {
  if (whiteReference) {
    try {
      localStorage.setItem('as7341_calibration', JSON.stringify(whiteReference));
      return true;
    } catch (e) {
      console.error('Failed to save calibration:', e);
      return false;
    }
  }
  return false;
}

export function loadCalibration() {
  return loadCalibrationFromStorage();
}

export function getCalibrationData() {
  return whiteReference ? { ...whiteReference } : null;
}

export function clearCalibration() {
  whiteReference = null;
  try {
    localStorage.removeItem('as7341_calibration');
  } catch (e) {
    console.error('Failed to clear calibration:', e);
  }
}

// Apply calibration to channels (returns differential values if calibrated)
export function applyCalibratedChannels(channels) {
  if (!channels) return channels;
  
  let result = { ...channels };
  if (whiteReference) {
    Object.keys(result).forEach(wavelength => {
      if (whiteReference[wavelength] !== undefined) {
        result[wavelength] = channels[wavelength] - whiteReference[wavelength];
      }
    });
  }
  return result;
}

// Convert AS7341 spectral data to CIE XYZ color space
function spectralToXYZ(channels) {
  if (!channels) return { X: 0, Y: 0, Z: 0 };

  let X = 0, Y = 0, Z = 0;

  // Sum weighted by CIE color matching functions
  Object.keys(CIE_MATCHING_FUNCTIONS).forEach(wavelength => {
    if (channels[wavelength] !== undefined) {
      const value = channels[wavelength];
      const [x, y, z] = CIE_MATCHING_FUNCTIONS[wavelength];
      X += value * x;
      Y += value * y;
      Z += value * z;
    }
  });

  return { X, Y, Z };
}

// Convert XYZ to sRGB (standard RGB color space)
function XYZtoRGB(X, Y, Z) {
  // XYZ to linear RGB transformation matrix (sRGB D65)
  let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  let b = X * 0.0557 + Y * -0.2040 + Z * 1.0570;

  // Gamma correction for sRGB (handle negatives)
  const gammaCorrect = (c) => {
    const sign = c < 0 ? -1 : 1;
    const absC = Math.abs(c);
    if (absC <= 0.0031308) {
      return sign * 12.92 * absC;
    } else {
      return sign * (1.055 * Math.pow(absC, 1/2.4) - 0.055);
    }
  };

  r = gammaCorrect(r);
  g = gammaCorrect(g);
  b = gammaCorrect(b);

  // Normalize to 0-255 range, handling negatives
  const max = Math.max(Math.abs(r), Math.abs(g), Math.abs(b), 0.01);
  r = Math.max(0, Math.min(255, ((r / max) * 127.5) + 127.5));
  g = Math.max(0, Math.min(255, ((g / max) * 127.5) + 127.5));
  b = Math.max(0, Math.min(255, (b / max) * 255));

  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// Enhanced color detection - returns confidence levels for all colors
export function detectColor(channels, applyCalibration = true) {
  if (!channels) return { 
    name: 'Unknown', 
    hex: '#808080', 
    confidence: 0, 
    rgb: { r: 128, g: 128, b: 128 },
    allConfidences: []
  };

  // Apply white balance calibration if requested and available
  let normalizedChannels = { ...channels };
  if (applyCalibration && whiteReference) {
    Object.keys(normalizedChannels).forEach(wavelength => {
      if (whiteReference[wavelength] !== undefined) {
        // Subtract reference to get differential (can be negative)
        normalizedChannels[wavelength] = channels[wavelength] - whiteReference[wavelength];
      }
    });
  }

  // Convert spectral data to XYZ then to RGB
  const xyz = spectralToXYZ(normalizedChannels);
  const rgb = XYZtoRGB(xyz.X, xyz.Y, xyz.Z);
  
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  // Calculate confidence for all colors
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b, 1);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const saturation = max > 0 ? delta / max : 0;
  const brightness = max / 255;

  // Calculate confidence scores for each color
  const colorConfidences = [];

  // Red confidence
  const redConf = (r / 255) * saturation * (r > g && r > b ? 1.5 : 0.5);
  colorConfidences.push({ name: 'Red', confidence: Math.min(redConf * 100, 100), hex: '#FF0000' });

  // Orange confidence
  const orangeConf = ((r + g) / 510) * saturation * (r > b && g > b && r > g * 0.7 ? 1.3 : 0.3);
  colorConfidences.push({ name: 'Orange', confidence: Math.min(orangeConf * 100, 100), hex: '#FF8000' });

  // Yellow confidence
  const yellowConf = ((r + g) / 510) * saturation * (r > b && g > b && Math.abs(r - g) < 50 ? 1.5 : 0.3);
  colorConfidences.push({ name: 'Yellow', confidence: Math.min(yellowConf * 100, 100), hex: '#FFFF00' });

  // Green confidence
  const greenConf = (g / 255) * saturation * (g > r && g > b ? 1.5 : 0.5);
  colorConfidences.push({ name: 'Green', confidence: Math.min(greenConf * 100, 100), hex: '#00FF00' });

  // Blue confidence
  const blueConf = (b / 255) * saturation * (b > r && b > g ? 1.5 : 0.5);
  colorConfidences.push({ name: 'Blue', confidence: Math.min(blueConf * 100, 100), hex: '#0000FF' });

  // Purple confidence
  const purpleConf = ((r + b) / 510) * saturation * (r > g && b > g ? 1.3 : 0.3);
  colorConfidences.push({ name: 'Purple', confidence: Math.min(purpleConf * 100, 100), hex: '#8000FF' });

  // Sort by confidence descending
  colorConfidences.sort((a, b) => b.confidence - a.confidence);

  // Top color is the detected color
  const topColor = colorConfidences[0];

  return { 
    name: topColor.name, 
    hex: hex, 
    confidence: (topColor.confidence / 100).toFixed(2), 
    rgb,
    allConfidences: colorConfidences
  };
}

// Convert RGB to Hex
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Calculate RGB from spectral data using CIE color matching functions
export function calculateRGB(channels) {
  if (!channels) return { r: 128, g: 128, b: 128 };

  const xyz = spectralToXYZ(channels);
  return XYZtoRGB(xyz.X, xyz.Y, xyz.Z);
}
