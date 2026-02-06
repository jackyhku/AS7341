import React, { useState } from 'react';
import AvrgirlArduino from 'avrgirl-arduino';

const FirmwareUploader = () => {
    const [status, setStatus] = useState('idle'); // idle, flashing, success, error
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const flashFirmware = async () => {
        if (!file) return;

        setStatus('flashing');
        setMessage('Starting upload...');
        setProgress(0);

        const fileReader = new FileReader();

        fileReader.onload = async (event) => {
            const fileBuffer = Buffer.from(event.target.result);

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
        };

        fileReader.readAsArrayBuffer(file);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Firmware Update</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Select Firmware (.hex)
                    </label>
                    <input
                        type="file"
                        accept=".hex"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700
                            cursor-pointer"
                    />
                </div>

                {status === 'flashing' && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: '100%' }} // Indeterminate for now
                        ></div>
                        <p className="text-xs text-center text-gray-400 mt-1">Flashing... please wait</p>
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
                    disabled={!file || status === 'flashing'}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${!file || status === 'flashing'
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {status === 'flashing' ? 'Flashing...' : 'Flash to Arduino'}
                </button>
            </div>
        </div>
    );
};

export default FirmwareUploader;
