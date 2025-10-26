import React, { useState } from 'react';
import type { ColorInfo } from '../types';

interface ColorPaletteProps {
  colors: ColorInfo[];
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const RegenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" /></svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onRegenerate, isRegenerating }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Color Palette</h3>
        <button onClick={onRegenerate} disabled={isRegenerating} className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 transition-colors">
            <RegenerateIcon />
            Regenerate
        </button>
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 transition-opacity ${isRegenerating ? 'opacity-30' : 'opacity-100'}`}>
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col">
            <div className="w-full h-24 rounded-lg" style={{ backgroundColor: color.hex }}></div>
            <div className="mt-2">
              <p className="font-semibold text-white">{color.name}</p>
              <div className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer" onClick={() => handleCopy(color.hex)}>
                <span>{color.hex}</span>
                <button className="text-gray-500 hover:text-white">
                    {copiedHex === color.hex ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">{color.usage}</p>
            </div>
          </div>
        ))}
      </div>
       {isRegenerating && <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-xl"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>}
    </div>
  );
};