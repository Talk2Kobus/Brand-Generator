import React from 'react';
import { ImageCard } from './ImageCard';
import type { RegenerationRequest } from '../types';

interface LogoDisplayProps {
  primaryLogoUrl: string;
  secondaryMarkUrls: string[];
  onRegenerate: (req: RegenerationRequest) => void;
  isRegenerating: boolean;
  regenerationInfo: RegenerationRequest | null;
}

export const LogoDisplay: React.FC<LogoDisplayProps> = ({ primaryLogoUrl, secondaryMarkUrls, onRegenerate, isRegenerating, regenerationInfo }) => {
  return (
    <div>
        <h3 className="text-2xl font-bold text-white mb-4">Logos & Marks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <ImageCard 
                    src={primaryLogoUrl} 
                    title="Primary Logo" 
                    isPrimary 
                    onRegenerate={() => onRegenerate({ type: 'primaryLogo', title: 'Primary Logo' })}
                    isLoading={isRegenerating && regenerationInfo?.type === 'primaryLogo'}
                />
            </div>
            {secondaryMarkUrls.length > 0 && (
                 <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <ImageCard 
                        src={secondaryMarkUrls[0]} 
                        title="Secondary Mark 1" 
                        onRegenerate={() => onRegenerate({ type: 'secondaryMark', title: 'Secondary Mark 1', index: 0 })}
                        isLoading={isRegenerating && regenerationInfo?.type === 'secondaryMark' && regenerationInfo?.index === 0}
                     />
                     <ImageCard 
                        src={secondaryMarkUrls[1]} 
                        title="Secondary Mark 2"
                        onRegenerate={() => onRegenerate({ type: 'secondaryMark', title: 'Secondary Mark 2', index: 1 })}
                        isLoading={isRegenerating && regenerationInfo?.type === 'secondaryMark' && regenerationInfo?.index === 1}
                     />
                </div>
            )}
        </div>
    </div>
  );
};