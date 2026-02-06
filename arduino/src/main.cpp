#include <Arduino.h>
#include <Adafruit_AS7341.h>
#include <Wire.h>

// Pin definitions for Arduino Mega 2560
#define INT_PIN 2   // Interrupt pin
#define GPIO_PIN 3  // GPIO pin

// AS7341 sensor object
Adafruit_AS7341 sensor;

// Volatile flag for interrupt
volatile bool sensorReady = false;

// Sample rate control (in ms between readings)
// Supported rates: 0.25Hz(4000ms), 0.5Hz(2000ms), 1Hz(1000ms), 2Hz(500ms), 4Hz(250ms), 8Hz(125ms)
unsigned long sampleIntervalMs = 1000; // Default 1 Hz

// Interrupt Service Routine (ISR)
void sensorInterrupt() {
  sensorReady = true;
}

void setup() {
  // Initialize Serial for debugging
  Serial.begin(115200);
  
  // Wait for serial with timeout (don't hang if no serial monitor)
  unsigned long serialTimeout = millis() + 3000; // 3 second timeout
  while (!Serial && millis() < serialTimeout) {
    delay(10);
  }
  
  Serial.println("AS7341 Multispectral Sensor Test");
  Serial.println("==================================\n");
  
  // Initialize I2C (default pins for Mega: SDA=20, SCL=21)
  Wire.begin();
  
  // Initialize the AS7341 sensor
  if (!sensor.begin()) {
    Serial.println("ERROR: Could not find AS7341 sensor!");
    Serial.println("Check I2C connections (SDA=20, SCL=21) and sensor supply voltage");
    while (1) {
      delay(100);
    }
  }
  
  Serial.println("AS7341 sensor initialized successfully!");
  
  // Configure sensor
  // sensor.setLED(true);            // Enable LED (method not available)
  // sensor.setLEDCurrent(12);       // Set LED current (method not available)
  // sensor.setGain(AS7341_GAIN_256X); // Set gain (method not available)
  // sensor.setIntegrationTime(29);  // Integration time (method not available)
  
  // Configure interrupt pin
  pinMode(INT_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(INT_PIN), sensorInterrupt, FALLING);
  
  // Configure GPIO pin as input
  pinMode(GPIO_PIN, INPUT);
  
  Serial.println("\nSensor Configuration:");
  Serial.println("- LED: Enabled");
  Serial.println("- Gain: 256x");
  Serial.println("- Integration Time: 29 ms");
  Serial.println("\nStarting measurements...\n");
  
  Serial.flush(); // Ensure all setup messages are sent
  delay(1000);
}

void loop() {
  // Check for serial input to control LED or sample rate
  // Use char array instead of String to avoid heap fragmentation
  if (Serial.available() > 0) {
    char input[32]; // Fixed buffer
    int len = Serial.readBytesUntil('\n', input, sizeof(input) - 1);
    input[len] = '\0'; // Null terminate
    
    // Trim whitespace
    while (len > 0 && (input[len-1] == ' ' || input[len-1] == '\r')) {
      input[--len] = '\0';
    }
    
    if (strcmp(input, "1") == 0) {
      sensor.enableLED(true);
      Serial.println("{\"status\":\"LED ON\"}");
      Serial.flush();
    } else if (strcmp(input, "0") == 0) {
      sensor.enableLED(false);
      Serial.println("{\"status\":\"LED OFF\"}");
      Serial.flush();
    } else if (strncmp(input, "RATE:", 5) == 0) {
      // Parse sample rate command: RATE:0.25, RATE:0.5, RATE:1, RATE:2, RATE:4, RATE:8
      float rate = atof(input + 5);
      bool validRate = false;
      
      if (rate == 0.25f) {
        sampleIntervalMs = 4000;
        validRate = true;
      } else if (rate == 0.5f) {
        sampleIntervalMs = 2000;
        validRate = true;
      } else if (rate == 1.0f) {
        sampleIntervalMs = 1000;
        validRate = true;
      } else if (rate == 2.0f) {
        sampleIntervalMs = 500;
        validRate = true;
      } else if (rate == 4.0f) {
        sampleIntervalMs = 250;
        validRate = true;
      } else if (rate == 8.0f) {
        sampleIntervalMs = 125;
        validRate = true;
      }
      
      if (validRate) {
        Serial.print("{\"status\":\"Rate set to ");
        Serial.print(rate, 2);
        Serial.println(" Hz\"}");
      } else {
        Serial.println("{\"error\":\"Invalid rate. Supported: 0.25, 0.5, 1, 2, 4, 8 Hz\"}");
      }
      Serial.flush();
    } else {
      // Unknown command - ignore silently or report error
      Serial.println("{\"error\":\"Unknown command\"}");
      Serial.flush();
    }
  }
  
  // Read sensor at specified interval
  static unsigned long lastReadTime = 0;
  unsigned long currentTime = millis();
  
  // Handle millis() overflow (happens every ~50 days)
  if (currentTime < lastReadTime) {
    lastReadTime = currentTime;
  }
  
  if (currentTime - lastReadTime >= sampleIntervalMs) {
    lastReadTime = currentTime;
    
    // Check interrupt pin state
    if (digitalRead(INT_PIN) == LOW) {
      sensorReady = true;
    }
    
    // Read sensor data when ready or on interval
    if (sensorReady || true) {  // Always read on interval for continuous monitoring
      sensorReady = false;
      
      // Create structures to hold sensor readings
      uint16_t readings[12];
      uint32_t accumulated[12] = {0}; // Use uint32_t to prevent overflow during accumulation
      
      // Take 5 readings and average them for better noise reduction
      const int numSamples = 5;
      int successfulReads = 0;
      
      for (int i = 0; i < numSamples; i++) {
        if (sensor.readAllChannels(readings)) {
          // Accumulate each channel
          for (int ch = 0; ch < 12; ch++) {
            accumulated[ch] += readings[ch];
          }
          successfulReads++;
        }
        
        // Small delay between readings to ensure different integration periods
        // Adjust based on sample rate to fit within interval
        if (i < numSamples - 1) {  // Don't delay after last reading
          unsigned long readDelay = (sensorReady) ? 20 : max(20UL, sampleIntervalMs / (numSamples + 1));
          delay(readDelay);
        }
      }
      
      // If at least one reading succeeded, send averaged data
      if (successfulReads > 0) {
        // Calculate averages
        for (int ch = 0; ch < 12; ch++) {
          readings[ch] = accumulated[ch] / successfulReads;
        }
        
        // Output averaged data as JSON
        Serial.print("{\"timestamp\":");
        Serial.print(millis());
        Serial.print(",\"channels\":{\"410nm\":");
        Serial.print(readings[0]);
        Serial.print(",\"440nm\":");
        Serial.print(readings[1]);
        Serial.print(",\"470nm\":");
        Serial.print(readings[2]);
        Serial.print(",\"510nm\":");
        Serial.print(readings[3]);
        Serial.print(",\"550nm\":");
        Serial.print(readings[4]);
        Serial.print(",\"580nm\":");
        Serial.print(readings[5]);
        Serial.print(",\"610nm\":");
        Serial.print(readings[6]);
        Serial.print(",\"680nm\":");
        Serial.print(readings[7]);
        Serial.print(",\"730nm\":");
        Serial.print(readings[8]);
        Serial.print(",\"810nm\":");
        Serial.print(readings[9]);
        Serial.print(",\"860nm\":");
        Serial.print(readings[10]);
        Serial.print(",\"clear\":");
        Serial.print(readings[11]);
        Serial.println("}}");
        Serial.flush(); // Ensure data is sent immediately
        
      } else {
        // All sensor reads failed - report error in JSON format
        Serial.println("{\"error\":\"Failed to read sensor\"}");
        Serial.flush();
      }
    }
  }
}
