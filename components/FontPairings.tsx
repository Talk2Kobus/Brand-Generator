import React from 'react';
import type { FontPairing } from '../types';

interface FontPairingsProps {
  fonts: FontPairing;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const RegenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" /></svg>
);

export const FontPairings: React.FC<FontPairingsProps> = ({ fonts, onRegenerate, isRegenerating }) => {
  const headerStyle = { fontFamily: `'${fonts.header}', sans-serif` };
  const bodyStyle = { fontFamily: `'${fonts.body}', sans-serif` };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Typography</h3>
        <button onClick={onRegenerate} disabled={isRegenerating} className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 transition-colors">
            <RegenerateIcon />
            Regenerate
        </button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${isRegenerating ? 'opacity-30' : 'opacity-100'}`}>
        <div>
          <p className="text-sm text-gray-400 mb-1">Header Font</p>
          <p className="text-lg font-semibold text-cyan-400">{fonts.header}</p>
          <h2 className="text-4xl font-bold mt-2" style={headerStyle}>
            The Quick Brown Fox Jumps
          </h2>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Body Font</p>
          <p className="text-lg font-semibold text-cyan-400">{fonts.body}</p>
          <p className="mt-4 text-gray-300" style={bodyStyle}>
            Over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
      {isRegenerating && <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-xl"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>}
    </div>
  );
};