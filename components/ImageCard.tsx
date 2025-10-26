import React, { useState } from 'react';

interface ImageCardProps {
    src: string;
    title: string;
    isPrimary?: boolean;
    onRegenerate?: () => void;
    isLoading?: boolean;
}

const RegenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ImageCard: React.FC<ImageCardProps> = ({ src, title, isPrimary = false, onRegenerate, isLoading = false }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 flex flex-col h-full group relative">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-white">{title}</h4>
                {onRegenerate && (
                    <button 
                        onClick={onRegenerate}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-600/80 hover:bg-cyan-500 p-2 rounded-full text-white"
                        aria-label={`Regenerate ${title}`}
                    >
                        <RegenerateIcon />
                    </button>
                )}
            </div>
            <div className={`flex-grow flex items-center justify-center w-full relative ${isPrimary ? 'h-64' : 'h-56'}`}>
                {!loaded && !isLoading && <div className={`bg-gray-700/50 rounded-lg animate-pulse w-full h-full`}></div>}
                <img 
                    src={src} 
                    alt={title} 
                    className={`object-contain transition-opacity duration-500 ${isPrimary ? 'max-h-64' : 'max-h-56'} ${loaded && !isLoading ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setLoaded(true)}
                    style={{ display: loaded ? 'block' : 'none' }}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center rounded-lg">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
        </div>
    );
};