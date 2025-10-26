import React, { useState, useCallback, useEffect } from 'react';
import {
  generateBrandIdentity,
  generateImage,
  suggestBusinessNames,
  regenerateLogoPrompt,
  regenerateMockupPrompt,
  regenerateColorPalette,
  regenerateFontPairing,
} from '../services/aiService';
import { checkDomainAvailability, getSuggestedTld } from '../services/domainService';
import type { DomainAvailability } from '../services/domainService';
import { generateBrandGuideHtml } from '../utils/generateBrandGuideHtml';
import type { BrandBible, RegenerationRequest } from '../types';
import { useError } from '../contexts/ErrorContext';

import { ColorPalette } from './ColorPalette';
import { FontPairings } from './FontPairings';
import { LogoDisplay } from './LogoDisplay';
import { MockupDisplay } from './MockupDisplay';
import { RegenerateModal } from './RegenerateModal';

interface BrandGeneratorProps {
  onBrandGenerated: (brandBible: BrandBible) => void;
}

type Stage = 'mission' | 'names' | 'generating' | 'done';
type DomainStatus = 'idle' | 'checking' | 'checked';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => (
    <svg className={`animate-spin text-white ${size}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const TLD_OPTIONS = ['.com', '.io', '.ai', '.app', '.co', '.net', '.org', '.xyz', '.shop', '.co.za', '.com.na', '.co.uk'];

export const BrandGenerator: React.FC<BrandGeneratorProps> = ({ onBrandGenerated }) => {
  const [stage, setStage] = useState<Stage>('mission');
  const [mission, setMission] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  
  const [domainStatus, setDomainStatus] = useState<DomainStatus>('idle');
  const [domainChecks, setDomainChecks] = useState<Record<string, DomainAvailability>>({});
  const [selectedTld, setSelectedTld] = useState('.com');

  const [selectedName, setSelectedName] = useState('');
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationRequest, setRegenerationRequest] = useState<RegenerationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { showError } = useError();

  useEffect(() => {
    // Fetch suggested TLD on component mount
    getSuggestedTld().then(tld => {
        if (tld && !TLD_OPTIONS.includes(tld)) {
            TLD_OPTIONS.unshift(tld); // Add to the top if not present
        }
        setSelectedTld(tld);
    });
  }, []);

  useEffect(() => {
    if (brandBible) {
      onBrandGenerated(brandBible);
    }
  }, [brandBible, onBrandGenerated]);

  const handleSuggestNames = async () => {
    setIsLoading(true);
    setProgressMessage("Brainstorming business names...");
    setDomainStatus('idle');
    setDomainChecks({});
    try {
      const names = await suggestBusinessNames(mission);
      setNameSuggestions(names);
      setStage('names');
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to suggest names.");
      setStage('mission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (nameSuggestions.length === 0) return;
    setDomainStatus('checking');
    try {
        const results = await checkDomainAvailability(nameSuggestions, selectedTld);
        setDomainChecks(results.reduce((acc, result) => {
            acc[result.domain] = result;
            return acc;
        }, {} as Record<string, DomainAvailability>));
        setDomainStatus('checked');
    } catch (err) {
        showError(err instanceof Error ? err.message : "Domain check failed.");
        setDomainStatus('idle');
    }
  };

  const handleNameSelection = async (name: string) => {
    if (!name.trim()) {
      showError("Please select or enter a business name.");
      return;
    }
    setSelectedName(name);
    setStage('generating');
    setIsLoading(true);

    try {
      setProgressMessage("Generating brand identity text...");
      const identityText = await generateBrandIdentity(mission, name);

      setProgressMessage("Creating primary logo...");
      const primaryLogoUrl = await generateImage(identityText.primaryLogoPrompt);
      
      setProgressMessage("Designing secondary marks...");
      const secondaryMarkUrls = await Promise.all(
        identityText.secondaryMarkPrompts.map(prompt => generateImage(prompt))
      );

      setProgressMessage("Producing brand mockups...");
      const mockupUrls = await Promise.all(
        identityText.mockupPrompts.map(async (prompt, i) => {
          const url = await generateImage(prompt);
          let title = `Mockup ${i+1}`;
          if (prompt.toLowerCase().includes('business card')) title = 'Business Card';
          else if (prompt.toLowerCase().includes('website') || prompt.toLowerCase().includes('laptop')) title = 'Website Mockup';
          else if (prompt.toLowerCase().includes('t-shirt') || prompt.toLowerCase().includes('apparel')) title = 'T-Shirt Mockup';
          return { title, url };
        })
      );

      const finalBible: BrandBible = {
        ...identityText,
        primaryLogoUrl,
        secondaryMarkUrls,
        mockupUrls,
      };

      setBrandBible(finalBible);
      setStage('done');
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to generate brand identity.");
      setStage('mission');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };
  
  const handleRegenerateSuggestions = async () => {
    await handleSuggestNames();
  };
  
  const handleOpenRegenerateModal = (req: RegenerationRequest) => {
    setRegenerationRequest(req);
    setIsModalOpen(true);
  };
  
  const handleRegenerate = async (changeRequest: string) => {
    if (!regenerationRequest || !brandBible || !mission || !selectedName) return;
    
    setIsRegenerating(true);
    setIsModalOpen(false);

    try {
        switch(regenerationRequest.type) {
            case 'primaryLogo': {
                const newPrompt = await regenerateLogoPrompt(mission, selectedName, brandBible, changeRequest, 'primary');
                const newUrl = await generateImage(newPrompt);
                setBrandBible(prev => prev ? { ...prev, primaryLogoUrl: newUrl, primaryLogoPrompt: newPrompt } : null);
                break;
            }
            case 'secondaryMark': {
                if (regenerationRequest.index === undefined) throw new Error("Index missing");
                const newPrompt = await regenerateLogoPrompt(mission, selectedName, brandBible, changeRequest, 'secondary');
                const newUrl = await generateImage(newPrompt);
                const newUrls = [...brandBible.secondaryMarkUrls];
                newUrls[regenerationRequest.index] = newUrl;
                const newPrompts = [...brandBible.secondaryMarkPrompts];
                newPrompts[regenerationRequest.index] = newPrompt;
                setBrandBible(prev => prev ? { ...prev, secondaryMarkUrls: newUrls, secondaryMarkPrompts: newPrompts } : null);
                break;
            }
            case 'mockup': {
                if (regenerationRequest.index === undefined) throw new Error("Index missing");
                const newPrompt = await regenerateMockupPrompt(mission, selectedName, brandBible, changeRequest, regenerationRequest.title);
                const newUrl = await generateImage(newPrompt);
                const newUrls = [...brandBible.mockupUrls];
                newUrls[regenerationRequest.index] = { ...newUrls[regenerationRequest.index], url: newUrl };
                const newPrompts = [...brandBible.mockupPrompts];
                newPrompts[regenerationRequest.index] = newPrompt;
                setBrandBible(prev => prev ? { ...prev, mockupUrls: newUrls, mockupPrompts: newPrompts } : null);
                break;
            }
            case 'colorPalette': {
                const newPalette = await regenerateColorPalette(mission, selectedName, brandBible, changeRequest);
                setBrandBible(prev => prev ? { ...prev, colorPalette: newPalette } : null);
                break;
            }
            case 'fontPairing': {
                const newFonts = await regenerateFontPairing(mission, selectedName, brandBible, changeRequest);
                setBrandBible(prev => prev ? { ...prev, fontPairing: newFonts } : null);
                break;
            }
        }
    } catch(err) {
        showError(err instanceof Error ? err.message : "Failed to regenerate item.");
    } finally {
        setIsRegenerating(false);
        setRegenerationRequest(null);
    }
  };

  const handleDownload = () => {
    if (!brandBible || !mission) return;
    const htmlContent = generateBrandGuideHtml(brandBible, mission);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${selectedName.toLowerCase().replace(/ /g, '_')}_brand_guide.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleStartOver = () => {
    setStage('mission');
    setMission('');
    setNameSuggestions([]);
    setDomainChecks({});
    setDomainStatus('idle');
    setSelectedName('');
    setBrandBible(null);
  };

  const renderContent = () => {
    if (isLoading && (stage === 'generating' || stage === 'mission')) {
      return (
        <div className="text-center p-12 bg-gray-800 rounded-lg max-w-lg mx-auto">
          <div className="flex justify-center items-center mb-4"><LoadingSpinner size="w-8 h-8" /></div>
          <p className="text-xl text-white">{progressMessage}</p>
          <p className="text-gray-400">Please wait, this can take a moment...</p>
        </div>
      );
    }
    
    switch (stage) {
      case 'mission':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Let's Build Your Brand</h2>
            <p className="text-lg text-center text-gray-400 mb-8">Start by describing your company's mission or business idea.</p>
            <form onSubmit={(e) => { e.preventDefault(); handleSuggestNames(); }} className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="e.g., 'An eco-friendly subscription box for house plants that helps people connect with nature.'"
                className="w-full h-40 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none mb-4 text-lg"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !mission.trim()} className="w-full flex items-center justify-center p-4 text-lg font-bold bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-white">
                {isLoading && stage === 'mission' ? <><LoadingSpinner /> <span className="ml-2">Working...</span></> : 'Suggest Business Names'}
              </button>
            </form>
          </div>
        );

      case 'names':
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Choose Your Name</h2>
            <p className="text-lg text-center text-gray-400 mb-8">Here are some AI-suggested names. Pick one, check domain availability, or enter your own.</p>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                    <span className="text-gray-300">Check availability for:</span>
                    <select value={selectedTld} onChange={(e) => { setSelectedTld(e.target.value); setDomainStatus('idle'); setDomainChecks({}); }} className="bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                      {TLD_OPTIONS.map(tld => <option key={tld} value={tld}>{tld}</option>)}
                    </select>
                </div>
                 <button onClick={handleCheckAvailability} disabled={domainStatus === 'checking'} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-white">
                  {domainStatus === 'checking' ? <><LoadingSpinner size="w-4 h-4" /> Checking...</> : 'Check Availability'}
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {nameSuggestions.map((name) => {
                  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '') + selectedTld;
                  const check = domainChecks[domain];

                  return (
                    <button key={name} onClick={() => handleNameSelection(name)} className="p-4 bg-gray-900 rounded-lg text-left hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500">
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
                  <button onClick={handleRegenerateSuggestions} disabled={isLoading} className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors">
                    Regenerate suggestions
                  </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleNameSelection(selectedName); }} className="flex gap-4 items-center mt-8">
              <input 
                type="text"
                placeholder="Or enter your chosen name here..."
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                className="flex-1 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
              />
              <button type="submit" className="px-6 py-3 font-bold bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 text-white" disabled={!selectedName.trim()}>Generate Brand</button>
            </form>
            <button onClick={() => setStage('mission')} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors mt-4 mx-auto block">
                &larr; Back to mission
            </button>
          </div>
        );
        
      case 'done':
        if (!brandBible) return null;
        return (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white">Your Brand Bible for <span className="text-cyan-400">{selectedName}</span></h2>
              <blockquote className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto border-l-4 border-cyan-700 pl-4 italic">"{mission}"</blockquote>
              <div className="mt-6 flex justify-center items-center gap-4">
                  <button onClick={handleDownload} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors">Download Brand Guide</button>
                   <button onClick={handleStartOver} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">Start Over</button>
              </div>
            </div>
            <ColorPalette 
                colors={brandBible.colorPalette} 
                onRegenerate={() => handleOpenRegenerateModal({ type: 'colorPalette', title: 'Regenerate Color Palette' })}
                isRegenerating={isRegenerating && regenerationRequest?.type === 'colorPalette'}
            />
            <FontPairings 
                fonts={brandBible.fontPairing} 
                onRegenerate={() => handleOpenRegenerateModal({ type: 'fontPairing', title: 'Regenerate Font Pairing' })}
                isRegenerating={isRegenerating && regenerationRequest?.type === 'fontPairing'}
            />
            <LogoDisplay 
                primaryLogoUrl={brandBible.primaryLogoUrl}
                secondaryMarkUrls={brandBible.secondaryMarkUrls}
                onRegenerate={handleOpenRegenerateModal}
                isRegenerating={isRegenerating && (regenerationRequest?.type === 'primaryLogo' || regenerationRequest?.type === 'secondaryMark')}
                regenerationInfo={regenerationRequest}
            />
            <MockupDisplay 
                mockups={brandBible.mockupUrls}
                onRegenerate={handleOpenRegenerateModal}
                isRegenerating={isRegenerating && regenerationRequest?.type === 'mockup'}
                regenerationInfo={regenerationRequest}
            />
          </div>
        );

      default:
        return null;
    }
  };
  
  const a = document.createElement('a'); // define 'a' here
  
  return (
    <>
      {renderContent()}
      <RegenerateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRegenerate}
        title={regenerationRequest?.title || "Regenerate"}
        isLoading={isRegenerating}
      />
    </>
  );
};
