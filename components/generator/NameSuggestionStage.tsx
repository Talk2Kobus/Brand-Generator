import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { DomainAvailability } from '../../services/domainService';

interface NameSuggestionStageProps {
  suggestions: string[];
  domainStatus: 'idle' | 'checking' | 'checked';
  domainChecks: Record<string, DomainAvailability>;
  selectedTld: string;
  tldOptions: string[];
  setSelectedTld: (tld: string) => void;
  onCheckAvailability: () => void;
  onNameSelect: (name: string) => void;
  onRegenerate: () => void;
  isLoading: boolean;
  selectedName: string;
  setSelectedName: (name: string) => void;
  onBack: () => void;
}

export const NameSuggestionStage: React.FC<NameSuggestionStageProps> = (props) => {
  const {
    suggestions,
    domainStatus,
    domainChecks,
    selectedTld,
    tldOptions,
    setSelectedTld,
    onCheckAvailability,
    onNameSelect,
    onRegenerate,
    isLoading,
    selectedName,
    setSelectedName,
    onBack,
  } = props;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Choose Your Name</h2>
      <p className="text-lg text-center text-gray-400 mb-8">Here are some AI-suggested names. Pick one, check domain availability, or enter your own.</p>
      
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Check availability for:</span>
            <select
              value={selectedTld}
              onChange={(e) => setSelectedTld(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              {tldOptions.map(tld => <option key={tld} value={tld}>{tld}</option>)}
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCheckAvailability}
            disabled={domainStatus === 'checking'}
            className="w-full sm:w-auto"
          >
            {domainStatus === 'checking' ? <><LoadingSpinner size="w-4 h-4" /> Checking...</> : 'Check Availability'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {suggestions.map((name) => {
            const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '') + selectedTld;
            const check = domainChecks[domain];

            return (
              <button
                key={name}
                onClick={() => onNameSelect(name)}
                className="p-4 bg-gray-900 rounded-lg text-left hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <p className="text-xl font-bold text-white">{name}</p>
                <div className="text-sm mt-1 h-5 flex items-center">
                  {domainStatus === 'checking' && <span className="text-gray-400">Checking...</span>}
                  {domainStatus === 'checked' && check && (
                    <span className={`flex items-center gap-1.5 ${check.isAvailable ? 'text-green-400' : 'text-yellow-500'}`}>
                      {check.isAvailable ? '✅' : '❌'} {check.domain} {check.isAvailable ? 'is available' : 'is taken'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          <Button variant="tertiary" size="sm" onClick={onRegenerate} disabled={isLoading}>
            Regenerate suggestions
          </Button>
        </div>
      </Card>

      <form onSubmit={(e) => { e.preventDefault(); onNameSelect(selectedName); }} className="flex gap-4 items-center mt-8">
        <Input
          type="text"
          placeholder="Or enter your chosen name here..."
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="lg" disabled={!selectedName.trim()}>
          Next: Define Voice &rarr;
        </Button>
      </form>
      <Button variant="tertiary" onClick={onBack} className="mt-4 mx-auto block text-sm !text-gray-400">
          &larr; Back to mission
      </Button>
    </div>
  );
};