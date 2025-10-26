import React, { useState, useEffect } from 'react';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (changeRequest: string) => void;
  title: string;
  isLoading: boolean;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({ isOpen, onClose, onSubmit, title, isLoading }) => {
  const [changeRequest, setChangeRequest] = useState('');

  useEffect(() => {
    if (isOpen) {
      setChangeRequest('');
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (changeRequest.trim()) {
      onSubmit(changeRequest);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 mb-4">Describe the changes you'd like to see. Be specific!</p>
            <textarea
              value={changeRequest}
              onChange={(e) => setChangeRequest(e.target.value)}
              placeholder="e.g., 'Use a warmer color palette' or 'Make the logo more geometric...'"
              className="w-full h-28 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="bg-gray-700/50 px-6 py-3 flex justify-end items-center gap-4 rounded-b-xl">
             <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !changeRequest.trim()}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Regenerating...
                </>
              ) : (
                'Submit Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};