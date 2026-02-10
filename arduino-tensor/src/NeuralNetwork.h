#ifndef NEURAL_NETWORK_H
#define NEURAL_NETWORK_H

#include <Arduino.h>

// Simple Feed-Forward Neural Network Implementation for Arduino
// Architecture: Input (12) -> Dense (16, ReLU) -> Output (N, Softmax)

class NeuralNetwork {
private:
    const float* weights_hidden;
    const float* biases_hidden;
    const float* weights_output;
    const float* biases_output;
    
    int input_size;
    int hidden_size;
    int output_size;

    // Activation Functions
    float relu(float x) {
        return x > 0 ? x : 0;
    }

    void softmax(float* input, int length) {
        float sum = 0;
        float max_val = input[0];
        
        // Find max for numerical stability
        for(int i=1; i<length; i++) {
            if(input[i] > max_val) max_val = input[i];
        }

        // Exponentiate and sum
        for(int i=0; i<length; i++) {
            input[i] = exp(input[i] - max_val);
            sum += input[i];
        }

        // Normalize
        for(int i=0; i<length; i++) {
            input[i] /= sum;
        }
    }

public:
    NeuralNetwork(int inputs, int hidden, int outputs, 
                 const float* w_h, const float* b_h, 
                 const float* w_o, const float* b_o) 
        : input_size(inputs), hidden_size(hidden), output_size(outputs),
          weights_hidden(w_h), biases_hidden(b_h), 
          weights_output(w_o), biases_output(b_o) {}

    // Run inference
    // input_data: Array of size input_size
    // output_data: Array of size output_size (will be overwritten with probabilities)
    // return: Index of highest probability class
    int predict(const float* input_data, float* output_data) {
        // 1. Hidden Layer
        // We need a temporary buffer for hidden layer output
        // Allocating on stack for speed (size is small: 16 floats)
        float hidden_layer[16]; 

        for (int h = 0; h < hidden_size; h++) {
            float sum = biases_hidden[h];
            for (int i = 0; i < input_size; i++) {
                // Weight index: h * input_size + i (row-major)
                // OR i * hidden_size + h? TFJS is usually (input, output) in shape
                // Let's assume (Input x Hidden) matrix standard multiplication
                // w_h index = i * hidden_size + h
                sum += input_data[i] * weights_hidden[i * hidden_size + h];
            }
            hidden_layer[h] = relu(sum);
        }

        // 2. Output Layer
        for (int o = 0; o < output_size; o++) {
            float sum = biases_output[o];
            for (int h = 0; h < hidden_size; h++) {
                // w_o index = h * output_size + o
                sum += hidden_layer[h] * weights_output[h * output_size + o];
            }
            output_data[o] = sum; // Store raw logits first
        }

        // 3. Softmax Activation
        softmax(output_data, output_size);

        // 4. Find ArgMax
        int best_class = 0;
        float highest_prob = output_data[0];
        for(int i=1; i<output_size; i++) {
            if(output_data[i] > highest_prob) {
                highest_prob = output_data[i];
                best_class = i;
            }
        }
        
        return best_class;
    }
};

#endif
