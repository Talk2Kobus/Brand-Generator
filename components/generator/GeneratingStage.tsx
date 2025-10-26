import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';

interface GeneratingStageProps {
  message: string;
}

export const GeneratingStage: React.FC<GeneratingStageProps> = ({ message }) => {
  return (
    <Card className="text-center !p-12 max-w-lg mx-auto">
      <div className="flex justify-center items-center mb-4"><LoadingSpinner size="w-8 h-8" /></div>
      <p className="text-xl text-white">{message}</p>
      <p className="text-gray-400">Please wait, this can take a moment...</p>
    </Card>
  );
};