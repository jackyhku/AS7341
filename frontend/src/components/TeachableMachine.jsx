import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import JSZip from 'jszip';
import ClassCard from './ClassCard';
import TrainingStats from './TrainingStats';
import InferenceDisplay from './InferenceDisplay';

const CHANNELS = [
    '410nm', '440nm', '470nm', '510nm', '550nm', '580nm',
    '610nm', '680nm', '730nm', '810nm', '860nm', 'clear'
];

export default function TeachableMachine({ sensorData }) {
    const [classes, setClasses] = useState([
        { id: 'class1', name: 'Class 1', samples: [] },
        { id: 'class2', name: 'Class 2', samples: [] }
    ]);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingLogs, setTrainingLogs] = useState([]);
    const [model, setModel] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [activeRecordingClassId, setActiveRecordingClassId] = useState(null);
    // Removed recordingIntervalRef as we now sync with data updates

    // -- Data Collection --

    // Effect to record samples when sensor data updates or active class changes
    const lastRecordedIdRef = useRef(null);

    useEffect(() => {
        // Only record if we have an active class and valid data
        if (!activeRecordingClassId || !sensorData || !sensorData.channels) return;

        // Prevent duplicate recording of the same sensor packet
        if (sensorData.id && lastRecordedIdRef.current === sensorData.id) {
            return;
        }
        lastRecordedIdRef.current = sensorData.id;

        let features = CHANNELS.map(ch => sensorData.channels[ch] || 0);
        features = normalize(features); // Normalize stored samples too!

        setClasses(prev => prev.map(cls => {
            if (cls.id === activeRecordingClassId) {
                return { ...cls, samples: [...cls.samples, features] };
            }
            return cls;
        }));

    }, [sensorData, activeRecordingClassId]);

    const handleRecordStart = (classId) => {
        if (!sensorData) return;
        setActiveRecordingClassId(classId);
        // Recording is now handled by the useEffect above
    };

    const handleRecordStop = () => {
        setActiveRecordingClassId(null);
    };

    // addSample helper removed/merged into useEffect to simplify dependencies  };

    // -- Training --

    const trainModel = async () => {
        if (classes.some(c => c.samples.length === 0)) {
            alert("Collect samples for all classes before training!");
            return;
        }

        setIsTraining(true);
        setTrainingLogs([]);

        // 1. Prepare Data
        const inputs = [];
        const labels = [];

        classes.forEach((cls, classIndex) => {
            cls.samples.forEach(sample => {
                inputs.push(sample);
                labels.push(classIndex);
            });
        });

        const xs = tf.tensor2d(inputs);
        const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), classes.length);

        // 2. Create Model
        const newModel = tf.sequential();
        newModel.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
            inputShape: [CHANNELS.length]
        }));
        newModel.add(tf.layers.dense({
            units: classes.length,
            activation: 'softmax'
        }));

        newModel.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        // 3. Train
        await newModel.fit(xs, ys, {
            epochs: 50,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    setTrainingLogs(prev => [...prev, logs]);
                }
            }
        });

        setModel(newModel);
        setIsTraining(false);

        // Cleanup tensors
        xs.dispose();
        ys.dispose();
    };

    const [isInferencing, setIsInferencing] = useState(false);
    const [notification, setNotification] = useState(null); // { message, type }
    const [inferenceCount, setInferenceCount] = useState(0);

    // Helper to normalize data (L2 Norm) to prevent Softmax saturation with large sensor values
    const normalize = (features) => {
        const sumSq = features.reduce((acc, val) => acc + (val * val), 0);
        const norm = Math.sqrt(sumSq) || 1; // Avoid divide by zero
        return features.map(v => v / norm);
    };

    // -- Inference --

    // Run inference whenever sensorData changes and inference is active
    useEffect(() => {
        if (!model || isTraining || !isInferencing || !sensorData || !sensorData.channels) return;

        let features = CHANNELS.map(ch => sensorData.channels[ch] || 0);
        features = normalize(features); // Normalize!

        // Wrap in tidy to ensure tensors are cleaned up
        const predictionData = tf.tidy(() => {
            const inputTensor = tf.tensor2d([features]);
            const predictionTensor = model.predict(inputTensor);
            return predictionTensor.dataSync();
        });

        setPredictions(Array.from(predictionData));
        setInferenceCount(c => c + 1); // Visual heartbeat
    }, [model, isTraining, isInferencing, sensorData]); // Run on every new data packet


    // -- Class Management --

    const addClass = () => {
        const nextId = classes.length + 1;
        setClasses([...classes, {
            id: `class${Date.now()}`,
            name: `Class ${nextId}`,
            samples: []
        }]);
    };

    const renameClass = (id, newName) => {
        setClasses(classes.map(c => c.id === id ? { ...c, name: newName } : c));
    };

    const deleteClass = (id) => {
        setClasses(classes.filter(c => c.id !== id));
        // Reset model if classes change structure
        setModel(null);
        setIsInferencing(false);
    };

    // -- Import / Export --

    const exportModel = async () => {
        if (!model) return;

        try {
            const zip = new JSZip();

            // 1. Save model topology and weights to the zip
            await model.save(tf.io.withSaveHandler(async (artifacts) => {
                // We must construct a proper TFJS model artifact JSON
                const modelJSON = {
                    modelTopology: artifacts.modelTopology,
                    format: artifacts.format,
                    generatedBy: artifacts.generatedBy,
                    convertedBy: artifacts.convertedBy,
                    weightsManifest: [{
                        paths: ['./weights.bin'],
                        weights: artifacts.weightSpecs
                    }]
                };

                zip.file("model.json", JSON.stringify(modelJSON));

                if (artifacts.weightData) {
                    zip.file("weights.bin", artifacts.weightData);
                }

                return {
                    modelArtifactsInfo: {
                        dateSaved: new Date(),
                        modelTopologyType: 'JSON',
                    },
                };
            }));

            // 2. Save classes metadata
            zip.file("classes.json", JSON.stringify(classes));

            // 3. Generate zip and trigger download
            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "teachable_machine_model.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification("Model exported as zip successfully!", "success");
        } catch (err) {
            console.error("Export failed:", err);
            showNotification("Failed to export model.", "error");
        }
    };

    const fileInputRef = useRef(null);

    const triggerImport = () => {
        fileInputRef.current.click();
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Reset inputs immediately
        event.target.value = null;

        try {
            let modelFile, weightsFile, classesFile;

            // Check if it's a zip file
            if (file.name.endsWith('.zip')) {
                const zip = await JSZip.loadAsync(file);

                // Extract files from zip
                const modelContent = await zip.file("model.json")?.async("string");
                const classesContent = await zip.file("classes.json")?.async("string");
                const weightsBlob = await zip.file("weights.bin")?.async("blob");

                if (!modelContent || !classesContent || !weightsBlob) {
                    throw new Error("Zip must contain model.json, classes.json, and weights.bin");
                }

                modelFile = new File([modelContent], 'model.json', { type: 'application/json' });
                classesFile = new File([classesContent], 'classes.json', { type: 'application/json' });
                weightsFile = new File([weightsBlob], 'weights.bin', { type: 'application/octet-stream' });

            } else {
                // Fallback to multiple file selection (legacy support manually disabled for now to simplify UI)
                showNotification("Please select a .zip file exported from this app.", "error");
                return;
            }

            // 1. Load Classes
            const classesText = await classesFile.text();
            const loadedClasses = JSON.parse(classesText);

            if (!Array.isArray(loadedClasses)) {
                throw new Error("Invalid classes.json format");
            }

            // 2. Load Model
            // Since we reconstructed the files with standard names, we don't need the complex renaming logic anymore!
            const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([modelFile, weightsFile]));

            // Recompile
            loadedModel.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // Success Updates
            setClasses(loadedClasses);
            setModel(loadedModel);
            setIsInferencing(false);
            showNotification("Model imported successfully from ZIP!", "success");

        } catch (err) {
            console.error("Import failed:", err);
            showNotification(`Import failed: ${err.message || 'Unknown error'}`, "error");
        }
    };

    return (
        <div className="flex flex-col gap-6 relative">

            {/* Notification Toast */}
            {notification && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-[-10px] px-6 py-3 rounded-lg shadow-xl z-50 text-white font-medium transition-all ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Top Controls */}
            <div className="flex justify-between items-center">
                <div className="space-x-4 flex items-center">
                    <button
                        onClick={trainModel}
                        disabled={isTraining || classes.length < 2}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${isTraining || classes.length < 2
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500'
                            }`}
                    >
                        {isTraining ? 'Training...' : 'Train Model'}
                    </button>

                    {model && (
                        <>
                            {!isInferencing ? (
                                <button
                                    onClick={() => setIsInferencing(true)}
                                    className="px-6 py-2 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors animate-pulse"
                                >
                                    Start Inference
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsInferencing(false)}
                                    className="px-6 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors"
                                >
                                    Stop Inference
                                </button>
                            )}

                            <button
                                onClick={exportModel}
                                className="px-6 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                                disabled={isInferencing}
                            >
                                Export Model
                            </button>
                        </>
                    )}

                    <button
                        onClick={triggerImport}
                        className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                        disabled={isInferencing}
                    >
                        Import Model
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".zip"
                        className="hidden"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Classes & Data Collection */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Data Collection</h2>

                    <div className="grid grid-cols-1 gap-4">
                        {classes.map(cls => (
                            <ClassCard
                                key={cls.id}
                                classData={cls}
                                isActive={activeRecordingClassId === cls.id}
                                onRecordStart={handleRecordStart}
                                onRecordStop={handleRecordStop}
                                onRename={renameClass}
                                onDelete={classes.length > 2 ? deleteClass : undefined}
                                disabled={isTraining}
                            />
                        ))}
                    </div>

                    <button
                        onClick={addClass}
                        className="w-full py-3 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                    >
                        + Add Class
                    </button>
                </div>

                {/* Right Column: Training & Inference */}
                <div className="space-y-6">
                    <TrainingStats logs={trainingLogs} />

                    {model && (
                        <InferenceDisplay
                            predictions={predictions}
                            classes={classes}
                            inferenceCount={inferenceCount}
                        />
                    )}

                    {!model && !isTraining && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                            <p>Collect samples and train the model to see realtime classification.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
