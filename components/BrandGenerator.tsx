import React, { useState, useCallback } from 'react';
import { 
  suggestBusinessNames,
  generateBrandIdentity, 
  generateImage, 
  regenerateLogoPrompt, 
  regenerateColorPalette, 
  regenerateFontPairing,
  regenerateMockupPrompt
} from '../services/aiService';
import type { BrandBible, BrandIdentityText, RegenerationRequest } from '../types';
import { ColorPalette } from './ColorPalette';
import { FontPairings } from './FontPairings';
import { LogoDisplay } from './LogoDisplay';
import { MockupDisplay } from './MockupDisplay';
import { RegenerateModal } from './RegenerateModal';
import { useError } from '../contexts/ErrorContext';
import { generateBrandGuideHtml } from '../utils/generateBrandGuideHtml';

// Declare global variables from included scripts
declare var JSZip: any;
declare var saveAs: any;

interface BrandGeneratorProps {
  onBrandGenerated: (bible: BrandBible) => void;
}

type NameSuggestionStep = 'idle' | 'suggesting' | 'suggested';

export const BrandGenerator: React.FC<BrandGeneratorProps> = ({ onBrandGenerated }) => {
  const [mission, setMission] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showError, hideError } = useError();
  
  const [nameSuggestionStep, setNameSuggestionStep] = useState<NameSuggestionStep>('idle');
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);

  const [regenerationRequest, setRegenerationRequest] = useState<RegenerationRequest | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSuggestNames = useCallback(async () => {
    if (!mission.trim()) {
        showError('Please describe your business mission first.');
        return;
    }
    setNameSuggestionStep('suggesting');
    try {
        const names = await suggestBusinessNames(mission);
        setSuggestedNames(names);
        setNameSuggestionStep('suggested');
    } catch(err) {
        console.error(err);
        showError(err instanceof Error ? err.message : 'Could not suggest names.');
        setNameSuggestionStep('idle');
    }
  }, [mission, showError]);

  const handleInitialGenerate = useCallback(async () => {
    if (!mission.trim()) {
      showError('Please enter a company mission.');
      return;
    }
     if (!companyName.trim()) {
      showError('Please enter a company name or select a suggestion.');
      return;
    }

    setIsLoading(true);
    setBrandBible(null);

    try {
      const identityText: BrandIdentityText = await generateBrandIdentity(mission, companyName);
      const imagePrompts = [
        identityText.primaryLogoPrompt,
        ...identityText.secondaryMarkPrompts,
        ...identityText.mockupPrompts,
      ];
      const generatedImages = await Promise.all(imagePrompts.map(prompt => generateImage(prompt)));
      const [primaryLogoUrl, secondaryMarkUrl1, secondaryMarkUrl2, ...mockupImageUrls] = generatedImages;
      const mockupTitles = ["Business Card", "Website Homepage", "T-Shirt"];
      
      const completeBrandBible: BrandBible = {
        ...identityText,
        primaryLogoUrl,
        secondaryMarkUrls: [secondaryMarkUrl1, secondaryMarkUrl2],
        mockupUrls: mockupImageUrls.map((url, index) => ({
            title: mockupTitles[index] || `Mockup ${index + 1}`,
            url,
        })),
      };

      setBrandBible(completeBrandBible);
      onBrandGenerated(completeBrandBible);

    } catch (err) {
      console.error(err);
      showError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mission, companyName, onBrandGenerated, showError]);

  const handleRequestRegeneration = useCallback((req: RegenerationRequest) => {
    setRegenerationRequest(req);
  }, []);

  const handleRegenerate = useCallback(async (changeRequest: string) => {
    if (!regenerationRequest || !brandBible) return;

    setIsRegenerating(true);

    try {
      switch (regenerationRequest.type) {
        case 'primaryLogo': {
          const newPrompt = await regenerateLogoPrompt(mission, companyName, brandBible, changeRequest, 'primary');
          const newUrl = await generateImage(newPrompt);
          setBrandBible(prev => prev ? { ...prev, primaryLogoUrl: newUrl, primaryLogoPrompt: newPrompt } : null);
          break;
        }
        case 'secondaryMark': {
          const index = regenerationRequest.index!;
          const newPrompt = await regenerateLogoPrompt(mission, companyName, brandBible, changeRequest, 'secondary');
          const newUrl = await generateImage(newPrompt);
          const newUrls = [...brandBible.secondaryMarkUrls];
          newUrls[index] = newUrl;
          const newPrompts = [...brandBible.secondaryMarkPrompts];
          newPrompts[index] = newPrompt;
          setBrandBible(prev => prev ? { ...prev, secondaryMarkUrls: newUrls, secondaryMarkPrompts: newPrompts } : null);
          break;
        }
        case 'mockup': {
            const index = regenerationRequest.index!;
            const newPrompt = await regenerateMockupPrompt(mission, companyName, brandBible, changeRequest, brandBible.mockupUrls[index].title);
            const newUrl = await generateImage(newPrompt);
            const newMockups = [...brandBible.mockupUrls];
            newMockups[index] = { ...newMockups[index], url: newUrl };
            const newPrompts = [...brandBible.mockupPrompts];
            newPrompts[index] = newPrompt;
            setBrandBible(prev => prev ? { ...prev, mockupUrls: newMockups, mockupPrompts: newPrompts } : null);
            break;
        }
        case 'colorPalette': {
            const newPalette = await regenerateColorPalette(mission, companyName, brandBible, changeRequest);
            setBrandBible(prev => prev ? { ...prev, colorPalette: newPalette } : null);
            break;
        }
        case 'fontPairing': {
            const newFonts = await regenerateFontPairing(mission, companyName, brandBible, changeRequest);
            const updatedBible = { ...brandBible, fontPairing: newFonts };
            setBrandBible(updatedBible);
            onBrandGenerated(updatedBible); // Propagate font change for dynamic loading
            break;
        }
      }
    } catch (err) {
      console.error(err);
      showError(err instanceof Error ? `Regeneration failed: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsRegenerating(false);
      setRegenerationRequest(null);
    }
  }, [regenerationRequest, brandBible, mission, companyName, onBrandGenerated, showError]);

  const handleDownload = async () => {
    if (!brandBible) return;
    setIsDownloading(true);
    hideError();

    try {
      const zip = new JSZip();

      const addImageToZip = (fileName: string, dataUrl: string) => {
        const base64Data = dataUrl.split(',')[1];
        zip.file(fileName, base64Data, { base64: true });
      };

      addImageToZip('primary-logo.png', brandBible.primaryLogoUrl);
      addImageToZip('secondary-mark-1.png', brandBible.secondaryMarkUrls[0]);
      addImageToZip('secondary-mark-2.png', brandBible.secondaryMarkUrls[1]);
      
      brandBible.mockupUrls.forEach((mockup) => {
          const fileName = `mockup-${mockup.title.toLowerCase().replace(/ /g, '-')}.png`;
          addImageToZip(fileName, mockup.url);
      });

      const htmlContent = generateBrandGuideHtml(brandBible, mission);
      zip.file('brand-guide.html', htmlContent);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'brand-bible.zip');
    } catch (err) {
      console.error("Failed to create zip file:", err);
      showError(err instanceof Error ? `Download failed: ${err.message}` : 'An unknown error occurred during download.');
    } finally {
      setIsDownloading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-12 animate-pulse">
      {/* Logos Skeleton */}
      <div>
        <div className="h-8 w-1/4 bg-gray-700 rounded-md mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
            <div className="h-6 w-1/2 bg-gray-700 rounded-md mb-4"></div>
            <div className="flex-grow bg-gray-700 rounded-lg h-64"></div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
              <div className="h-6 w-3/4 bg-gray-700 rounded-md mb-4"></div>
              <div className="flex-grow bg-gray-700 rounded-lg h-56"></div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
              <div className="h-6 w-3/4 bg-gray-700 rounded-md mb-4"></div>
              <div className="flex-grow bg-gray-700 rounded-lg h-56"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Mockups Skeleton */}
      <div>
        <div className="h-8 w-1/3 bg-gray-700 rounded-md mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
              <div className="h-6 w-1/2 bg-gray-700 rounded-md mb-4"></div>
              <div className="flex-grow bg-gray-700 rounded-lg h-56"></div>
            </div>
          ))}
        </div>
      </div>
      {/* Color Palette Skeleton */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="h-7 w-1/4 bg-gray-700 rounded-md mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-24 bg-gray-700 rounded-lg"></div>
              <div className="mt-2 space-y-2">
                <div className="h-5 w-3/4 bg-gray-700 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Typography Skeleton */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="h-7 w-1/5 bg-gray-700 rounded-md mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-5 w-1/3 bg-gray-700 rounded-md mb-2"></div>
            <div className="h-10 w-full bg-gray-700 rounded-md mt-2"></div>
          </div>
          <div>
            <div className="h-5 w-1/3 bg-gray-700 rounded-md mb-2"></div>
            <div className="space-y-2 mt-4">
              <div className="h-5 w-full bg-gray-700 rounded-md"></div>
              <div className="h-5 w-5/6 bg-gray-700 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-1">Step 1: Your Mission</h2>
        <p className="text-gray-400 mb-4">
          Describe your business, its values, and what it aims to achieve. This will be used to generate your brand identity.
        </p>
        <textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="e.g., 'To empower small businesses with affordable and easy-to-use software solutions...'"
          className="w-full h-24 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-colors duration-200 resize-none"
          disabled={isLoading}
        />
        
        <h2 className="text-2xl font-bold text-white mt-6 mb-1">Step 2: Your Company Name</h2>
        <p className="text-gray-400 mb-4">
          Enter your company name, or get some AI-powered suggestions based on your mission.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., 'Innovatech Solutions'"
              className="flex-grow p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-colors duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSuggestNames}
              disabled={!mission || nameSuggestionStep === 'suggesting' || isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {nameSuggestionStep === 'suggesting' ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Suggesting...
                </>
              ) : (
                <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Suggest Names
                </>
              )}
            </button>
        </div>

        {nameSuggestionStep === 'suggested' && (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-3">Click a name to use it, or regenerate for more ideas:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedNames.map((name, i) => (
                        <button key={i} onClick={() => setCompanyName(name)} className="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded-full hover:bg-cyan-600 hover:text-white transition-colors">
                            {name}
                        </button>
                    ))}
                </div>
                 {/* FIX: This comparison was always false due to type narrowing. Changed to disable during main generation loading state for consistency. */}
                 <button onClick={handleSuggestNames} disabled={isLoading} className="text-sm text-cyan-400 hover:text-cyan-300 mt-3 disabled:opacity-50">
                    Regenerate suggestions
                </button>
            </div>
        )}

        <div className="mt-6 border-t border-gray-700 pt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleInitialGenerate}
              disabled={isLoading || !mission || !companyName}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Brand Bible...
                </>
              ) : (
                'Generate Brand'
              )}
            </button>
            {brandBible && !isLoading && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Brand Bible
                  </>
                )}
              </button>
            )}
        </div>
      </div>

      {isLoading && <LoadingSkeleton />}

      {brandBible && !isLoading && (
        <div className="space-y-12">
          <LogoDisplay 
            primaryLogoUrl={brandBible.primaryLogoUrl} 
            secondaryMarkUrls={brandBible.secondaryMarkUrls}
            onRegenerate={handleRequestRegeneration}
            isRegenerating={isRegenerating && (regenerationRequest?.type === 'primaryLogo' || regenerationRequest?.type === 'secondaryMark')}
            regenerationInfo={regenerationRequest}
          />
          <MockupDisplay 
            mockups={brandBible.mockupUrls}
            onRegenerate={handleRequestRegeneration}
            isRegenerating={isRegenerating && regenerationRequest?.type === 'mockup'}
            regenerationInfo={regenerationRequest}
          />
          <ColorPalette 
            colors={brandBible.colorPalette}
            onRegenerate={() => handleRequestRegeneration({ type: 'colorPalette', title: 'Color Palette' })}
            isRegenerating={isRegenerating && regenerationRequest?.type === 'colorPalette'}
          />
          <FontPairings 
            fonts={brandBible.fontPairing}
            onRegenerate={() => handleRequestRegeneration({ type: 'fontPairing', title: 'Typography' })}
            isRegenerating={isRegenerating && regenerationRequest?.type === 'fontPairing'}
          />
        </div>
      )}

      {regenerationRequest && (
        <RegenerateModal
            isOpen={!!regenerationRequest}
            onClose={() => setRegenerationRequest(null)}
            onSubmit={handleRegenerate}
            title={`Regenerate ${regenerationRequest.title}`}
            isLoading={isRegenerating}
        />
      )}
    </div>
  );
};
