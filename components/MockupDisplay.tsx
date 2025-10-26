import React from 'react';
import { ImageCard } from './ImageCard';
import type { RegenerationRequest } from '../types';

interface MockupDisplayProps {
  mockups: { title: string; url: string }[];
  onRegenerate: (req: RegenerationRequest) => void;
  isRegenerating: boolean;
  regenerationInfo: RegenerationRequest | null;
}

export const MockupDisplay: React.FC<MockupDisplayProps> = ({ mockups, onRegenerate, isRegenerating, regenerationInfo }) => {
  if (!mockups || mockups.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4">Brand in Action</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockups.map((mockup, index) => (
          <ImageCard 
            key={mockup.title} 
            src={mockup.url} 
            title={mockup.title} 
            onRegenerate={() => onRegenerate({ type: 'mockup', title: mockup.title, index: index })}
            isLoading={isRegenerating && regenerationInfo?.type === 'mockup' && regenerationInfo?.index === index}
          />
        ))}
      </div>
    </div>
  );
};