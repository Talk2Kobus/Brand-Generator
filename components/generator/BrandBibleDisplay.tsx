import React from 'react';
import type { BrandBible, RegenerationRequest } from '../../types';
import { Button } from '../ui/Button';
import { ColorPalette } from '../ColorPalette';
import { FontPairings } from '../FontPairings';
import { LogoDisplay } from '../LogoDisplay';
import { MockupDisplay } from '../MockupDisplay';

interface BrandBibleDisplayProps {
  brandBible: BrandBible;
  mission: string;
  selectedName: string;
  isAuthenticated: boolean;
  isSaving: boolean;
  onDownload: () => void;
  onStartOver: () => void;
  onSave: () => void;
  onOpenRegenerateModal: (req: RegenerationRequest) => void;
  isRegenerating: boolean;
  regenerationRequest: RegenerationRequest | null;
}

export const BrandBibleDisplay: React.FC<BrandBibleDisplayProps> = (props) => {
  const {
    brandBible, mission, selectedName, isAuthenticated, isSaving,
    onDownload, onStartOver, onSave, onOpenRegenerateModal,
    isRegenerating, regenerationRequest
  } = props;
  
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white">Your Brand Bible for <span className="text-cyan-400">{selectedName}</span></h2>
        <blockquote className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto border-l-4 border-cyan-700 pl-4 italic">"{mission}"</blockquote>
        {brandBible.brandVoice && (
          <div className="mt-4 text-gray-300">
            <strong>Brand Voice:</strong> {brandBible.brandVoice.name} <span className="text-gray-400">({brandBible.brandVoice.keywords.join(', ')})</span>
          </div>
        )}
        <div className="mt-6 flex justify-center items-center gap-4">
          <Button onClick={onDownload}>Download Brand Guide</Button>
          <Button onClick={onStartOver} variant="secondary">Start Over</Button>
          {isAuthenticated && (
            <Button onClick={onSave} variant="success" disabled={isSaving}>
              {isSaving ? 'Saving...' : (brandBible.id ? 'Saved' : 'Save to Library')}
            </Button>
          )}
        </div>
      </div>
      <ColorPalette
        colors={brandBible.colorPalette}
        onRegenerate={() => onOpenRegenerateModal({ type: 'colorPalette', title: 'Regenerate Color Palette' })}
        isRegenerating={isRegenerating && regenerationRequest?.type === 'colorPalette'}
      />
      <FontPairings
        fonts={brandBible.fontPairing}
        onRegenerate={() => onOpenRegenerateModal({ type: 'fontPairing', title: 'Regenerate Font Pairing' })}
        isRegenerating={isRegenerating && regenerationRequest?.type === 'fontPairing'}
      />
      <LogoDisplay
        primaryLogoUrl={brandBible.primaryLogoUrl}
        secondaryMarkUrls={brandBible.secondaryMarkUrls}
        onRegenerate={onOpenRegenerateModal}
        isRegenerating={isRegenerating && (regenerationRequest?.type === 'primaryLogo' || regenerationRequest?.type === 'secondaryMark')}
        regenerationInfo={regenerationRequest}
      />
      <MockupDisplay
        mockups={brandBible.mockupUrls}
        onRegenerate={onOpenRegenerateModal}
        isRegenerating={isRegenerating && regenerationRequest?.type === 'mockup'}
        regenerationInfo={regenerationRequest}
      />
    </div>
  );
};