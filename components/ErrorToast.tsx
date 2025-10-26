import React, { useEffect } from 'react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000); // Auto-dismiss after 7 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-fade-in-down" role="alert" aria-live="assertive">
      <div className="bg-red-800/80 backdrop-blur-md border border-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-grow">
          <p className="font-bold">An Error Occurred</p>
          <p className="text-sm text-red-200">{message}</p>
        </div>
        <button onClick={onDismiss} className="text-red-300 hover:text-white transition-colors" aria-label="Dismiss error message">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
