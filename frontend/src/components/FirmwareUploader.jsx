import React, { useState } from 'react';
import AvrgirlArduino from 'avrgirl-arduino';

const FirmwareUploader = () => {
    const [status, setStatus] = useState('idle'); // idle, flashing, success, error
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);

    const flashFirmware = async () => {
        setStatus('flashing');
        setMessage('Downloading firmware...');
        setProgress(0);

        try {
            // Fetch bundled firmware from public folder
            const response = await fetch('/firmware.hex');
            if (!response.ok) {
                throw new Error('Firmware file not found. Please ensure firmware.hex is in the public folder.');
            }
            const arrayBuffer = await response.arrayBuffer();
            const fileBuffer = Buffer.from(arrayBuffer);

            setMessage('Flashing firmware...');

            const avrgirl = new AvrgirlArduino({
                board: 'mega',
                debug: true
            });

            avrgirl.flash(fileBuffer, (error) => {
                if (error) {
                    console.error(error);
                    setStatus('error');
                    setMessage(`Error: ${error.message}`);
                } else {
                    console.log('done');
                    setStatus('success');
                    setMessage('Upload complete!');
                    setProgress(100);
                }
            });

        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Firmware Update</h2>

            <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                    Click the button below to update your Arduino with the latest bundled firmware.
                    Make sure the device is plugged in but <strong>not connected</strong> above.
                </p>

                {status === 'flashing' && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: '100%' }} // Indeterminate for now
                        ></div>
                        <p className="text-xs text-center text-gray-400 mt-1">Processing... please wait</p>
                    </div>
                )}

                {message && (
                    <div className={`text-sm p-3 rounded ${status === 'error' ? 'bg-red-900/50 text-red-200' :
                            status === 'success' ? 'bg-green-900/50 text-green-200' :
                                'bg-blue-900/50 text-blue-200'
                        }`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={flashFirmware}
                    disabled={status === 'flashing'}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${status === 'flashing'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {status === 'flashing' ? 'Updating...' : 'Update Firmware'}
                </button>
            </div>
        </div>
    );
};

export default FirmwareUploader;
