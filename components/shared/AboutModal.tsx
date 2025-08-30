
import React, { useState, useEffect } from 'react';
import CloseIcon from '../icons/CloseIcon';

interface Metadata {
    name: string;
    description: string;
}

interface AboutModalProps {
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch('/metadata.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMetadata(data);
            } catch (e) {
                console.error("Failed to fetch metadata:", e);
                setError("Could not load application information.");
            }
        };

        fetchMetadata();
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {metadata ? `About ${metadata.name}` : 'About'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {error && <p className="text-red-500">{error}</p>}
                    {!metadata && !error && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
                    {metadata && (
                        <>
                            <p className="text-gray-600 dark:text-gray-300">{metadata.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Version: 1.0.0</p>
                        </>
                    )}
                </div>
                 <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AboutModal;
