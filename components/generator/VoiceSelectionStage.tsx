import React from 'react';
import type { BrandVoice } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface VoiceSelectionStageProps {
  brandVoices: BrandVoice[];
  selectedName: string;
  onSelectVoice: (voice: BrandVoice) => void;
  onSkip: () => void;
}

export const VoiceSelectionStage: React.FC<VoiceSelectionStageProps> = ({ brandVoices, selectedName, onSelectVoice, onSkip }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Define Your Brand's Voice</h2>
      <p className="text-lg text-center text-gray-400 mb-8">
        Choose the personality that best fits <span className="font-bold text-cyan-400">{selectedName}</span>. This will influence your entire brand identity.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brandVoices.map((voice) => (
          <Card key={voice.name} className="!p-6 flex flex-col text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{voice.name}</h3>
            <p className="text-gray-300 flex-grow">{voice.description}</p>
            <div className="my-4">
              {voice.keywords.map(kw => (
                <span key={kw} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2 mb-2">{kw}</span>
              ))}
            </div>
            <Button onClick={() => onSelectVoice(voice)} size="lg" className="mt-auto w-full">
              Select this Voice
            </Button>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button variant="tertiary" onClick={onSkip}>
          Skip and Generate Brand &rarr;
        </Button>
      </div>
    </div>
  );
};