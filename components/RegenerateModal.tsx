import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';

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
            <Textarea
              value={changeRequest}
              onChange={(e) => setChangeRequest(e.target.value)}
              placeholder="e.g., 'Use a warmer color palette' or 'Make the logo more geometric...'"
              className="h-28"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="bg-gray-700/50 px-6 py-3 flex justify-end items-center gap-4 rounded-b-xl">
             <Button type="button" onClick={onClose} disabled={isLoading} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !changeRequest.trim()}
              size="sm"
            >
              {isLoading ? 'Regenerating...' : 'Submit Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};