#include <Arduino.h>
#include <Adafruit_AS7341.h>
#include <Wire.h>
#include "NeuralNetwork.h"
#include "model_data.h"

Adafruit_AS7341 sensor;
NeuralNetwork* nn;

// Buffer for model output probabilities
float output_probs[OUTPUT_NODES];

// Normalization stats (if used in web app, must mirror here)
// For now, assuming raw L2 norm or basic scaling
float input_buffer[12];

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 3000);

    Serial.println("AS7341 TinyML Inference Test");

    // Initialize I2C
    Wire.begin();
    
    if (!sensor.begin()) {
        Serial.println("Error: AS7341 not found");
        while(1);
    }

    sensor.setATIME(100);
    sensor.setASTEP(999);
    sensor.setGain(AS7341_GAIN_256X);

    // Initialize Neural Network
    nn = new NeuralNetwork(INPUT_NODES, HIDDEN_NODES, OUTPUT_NODES,
                           WEIGHTS_HIDDEN, BIASES_HIDDEN,
                           WEIGHTS_OUTPUT, BIASES_OUTPUT);
                           
    Serial.println("Model loaded.");
    Serial.print("Classes: ");
    for(int i=0; i<OUTPUT_NODES; i++) {
        Serial.print(CLASS_NAMES[i]);
        Serial.print(" ");
    }
    Serial.println();
}

void l2_normalize(float* vector, int length) {
    float sum_sq = 0;
    for (int i=0; i<length; i++) sum_sq += vector[i] * vector[i];
    float magnitude = sqrt(sum_sq);
    if (magnitude > 0) {
        for (int i=0; i<length; i++) vector[i] /= magnitude;
    }
}

void loop() {
    // 1. Read Sensor
    uint16_t readings[12];
    if (sensor.readAllChannels(readings)) {
        // Convert to float and fill buffer (mapping sensor channels to input nodes)
        // 0-9: Spectral 410-860nm
        // 10-11: Clear/NIR (Check your model training input mapping!)
        // Assuming strictly 12 channels in order:
        for(int i=0; i<12; i++) input_buffer[i] = (float)readings[i];

        // 2. Preprocessing (MUST MATCH WEB APP)
        l2_normalize(input_buffer, 12);

        // 3. Inference
        unsigned long start_time = micros();
        int predicted_class = nn->predict(input_buffer, output_probs);
        unsigned long duration = micros() - start_time;

        // 4. Output Result
        Serial.print("Prediction: ");
        Serial.print(CLASS_NAMES[predicted_class]);
        Serial.print(" (");
        Serial.print(output_probs[predicted_class] * 100, 1);
        Serial.print("%) Time: ");
        Serial.print(duration);
        Serial.println(" us");

        // Example: Control LED based on class
        // if (predicted_class == 0) digitalWrite(LED_BUILTIN, HIGH);
        // else digitalWrite(LED_BUILTIN, LOW);

    } else {
        Serial.println("Sensor read failed");
    }

    delay(250); // 4Hz
}
