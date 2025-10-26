import React, { useState, useCallback, useEffect } from 'react';
import {
  generateBrandIdentity,
  generateImage,
  suggestBusinessNames,
  generateBrandVoiceArchetypes,
  regenerateLogoPrompt,
  regenerateMockupPrompt,
  regenerateColorPalette,
  regenerateFontPairing,
} from '../services/aiService';
import { checkDomainAvailability, getSuggestedTld } from '../services/domainService';
import * as apiService from '../services/apiService';
import type { DomainAvailability } from '../services/domainService';
import { generateBrandGuideHtml } from '../utils/generateBrandGuideHtml';
import type { BrandBible, BrandVoice, RegenerationRequest } from '../types';
import { useError } from '../contexts/ErrorContext';
import { useAuth } from '../contexts/AuthContext';

import { MissionStage } from './generator/MissionStage';
import { NameSuggestionStage } from './generator/NameSuggestionStage';
import { VoiceSelectionStage } from './generator/VoiceSelectionStage';
import { GeneratingStage } from './generator/GeneratingStage';
import { BrandBibleDisplay } from './generator/BrandBibleDisplay';
import { RegenerateModal } from './RegenerateModal';

interface BrandGeneratorProps {
  onBrandGenerated: (brandBible: BrandBible) => void;
  initialBrand: BrandBible | null;
  setInitialBrand: (brand: BrandBible | null) => void;
}

type Stage = 'mission' | 'names' | 'voice' | 'generating' | 'done';

const TLD_OPTIONS = ['.com', '.io', '.ai', '.app', '.co', '.net', '.org', '.xyz', '.shop', '.co.za', '.com.na', '.co.uk'];

export const BrandGenerator: React.FC<BrandGeneratorProps> = ({ onBrandGenerated, initialBrand, setInitialBrand }) => {
  const [stage, setStage] = useState<Stage>('mission');
  const [mission, setMission] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'checked'>('idle');
  const [domainChecks, setDomainChecks] = useState<Record<string, DomainAvailability>>({});
  const [selectedTld, setSelectedTld] = useState('.com');

  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationRequest, setRegenerationRequest] = useState<RegenerationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { showError } = useError();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (initialBrand) {
      setBrandBible(initialBrand);
      setMission(initialBrand.mission || '');
      setCompanyName(initialBrand.companyName || '');
      setStage('done');
      setInitialBrand(null);
    }
  }, [initialBrand, setInitialBrand]);

  useEffect(() => {
    getSuggestedTld().then(tld => {
        if (tld && !TLD_OPTIONS.includes(tld)) {
            TLD_OPTIONS.unshift(tld);
        }
        setSelectedTld(tld || '.com');
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

  const handleMissionSubmit = () => {
    if (companyName.trim()) {
      handleNameSelection(companyName.trim());
    } else {
      handleSuggestNames();
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
    const finalName = name.trim();
    setCompanyName(finalName);
    setIsLoading(true);
    setProgressMessage("Defining brand personality...");
    try {
      const voices = await generateBrandVoiceArchetypes(mission, finalName);
      setBrandVoices(voices);
      setStage('voice');
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to generate brand voices. Proceeding without this step.");
      await handleGenerateBrand(finalName, undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBrand = useCallback(async (name: string, voice: BrandVoice | undefined) => {
    setCompanyName(name);
    setStage('generating');
    setIsLoading(true);

    try {
      setProgressMessage("Generating brand identity text...");
      const identityText = await generateBrandIdentity(mission, name, voice);
      setProgressMessage("Creating primary logo...");
      const primaryLogoUrl = await generateImage(identityText.primaryLogoPrompt);
      setProgressMessage("Designing secondary marks...");
      const secondaryMarkUrls = await Promise.all(identityText.secondaryMarkPrompts.map(prompt => generateImage(prompt)));
      setProgressMessage("Producing brand mockups...");
      const mockupUrls = await Promise.all(
        identityText.mockupPrompts.map(async (prompt, i) => {
          const url = await generateImage(prompt);
          let title = `Mockup ${i+1}`;
          if (prompt.toLowerCase().includes('business card')) title = 'Business Card';
          else if (prompt.toLowerCase().includes('website')) title = 'Website Mockup';
          else if (prompt.toLowerCase().includes('t-shirt')) title = 'T-Shirt Mockup';
          return { title, url };
        })
      );
      
      const finalBible: BrandBible = { ...identityText, mission, companyName: name, brandVoice: voice, primaryLogoUrl, secondaryMarkUrls, mockupUrls };
      setBrandBible(finalBible);
      setStage('done');
      apiService.trackAnalyticsEvent('BRAND_CREATED', { colors: finalBible.colorPalette.map(c => c.hex), headerFont: finalBible.fontPairing.header, bodyFont: finalBible.fontPairing.body });

    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to generate brand identity.");
      setStage('mission');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [mission, showError]);
  
  const handleOpenRegenerateModal = (req: RegenerationRequest) => {
    setRegenerationRequest(req);
    setIsModalOpen(true);
  };
  
  const handleRegenerate = async (changeRequest: string) => {
    if (!regenerationRequest || !brandBible || !mission || !companyName) return;
    
    setIsRegenerating(true);
    setIsModalOpen(false);
    const updateBible = (updates: Partial<BrandBible>) => setBrandBible(prev => prev ? { ...prev, ...updates } : null);

    try {
        switch(regenerationRequest.type) {
            case 'primaryLogo': {
                const newPrompt = await regenerateLogoPrompt(mission, companyName, brandBible, changeRequest, 'primary');
                const newUrl = await generateImage(newPrompt);
                updateBible({ primaryLogoUrl: newUrl, primaryLogoPrompt: newPrompt });
                break;
            }
            case 'secondaryMark': {
                const { index } = regenerationRequest;
                if (index === undefined) throw new Error("Index missing");
                const newPrompt = await regenerateLogoPrompt(mission, companyName, brandBible, changeRequest, 'secondary');
                const newUrl = await generateImage(newPrompt);
                const newUrls = [...brandBible.secondaryMarkUrls]; newUrls[index] = newUrl;
                const newPrompts = [...brandBible.secondaryMarkPrompts]; newPrompts[index] = newPrompt;
                updateBible({ secondaryMarkUrls: newUrls, secondaryMarkPrompts: newPrompts });
                break;
            }
            case 'mockup': {
                const { index, title } = regenerationRequest;
                if (index === undefined) throw new Error("Index missing");
                const newPrompt = await regenerateMockupPrompt(mission, companyName, brandBible, changeRequest, title);
                const newUrl = await generateImage(newPrompt);
                const newUrls = [...brandBible.mockupUrls]; newUrls[index] = { ...newUrls[index], url: newUrl };
                const newPrompts = [...brandBible.mockupPrompts]; newPrompts[index] = newPrompt;
                updateBible({ mockupUrls: newUrls, mockupPrompts: newPrompts });
                break;
            }
            case 'colorPalette':
                updateBible({ colorPalette: await regenerateColorPalette(mission, companyName, brandBible, changeRequest) });
                break;
            case 'fontPairing':
                updateBible({ fontPairing: await regenerateFontPairing(mission, companyName, brandBible, changeRequest) });
                break;
        }
    } catch(err) {
        showError(err instanceof Error ? err.message : "Failed to regenerate item.");
    } finally {
        setIsRegenerating(false);
        setRegenerationRequest(null);
    }
  };
  
  const handleSaveBrand = async () => {
    if (!brandBible || !mission || !companyName) return;
    setIsSaving(true);
    try {
        const savedBrand = await apiService.saveBrand(brandBible, mission, companyName);
        setBrandBible(prev => prev ? { ...prev, id: savedBrand.id } : null);
        showError("Brand saved successfully!");
    } catch(err) {
        showError(err instanceof Error ? err.message : "Failed to save brand.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!brandBible || !mission || !companyName) return;
    const htmlContent = generateBrandGuideHtml(brandBible, mission, companyName);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${companyName.toLowerCase().replace(/ /g, '_')}_brand_guide.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };
  
  const handleStartOver = () => {
    setStage('mission');
    setMission('');
    setNameSuggestions([]);
    setDomainChecks({});
    setDomainStatus('idle');
    setCompanyName('');
    setBrandVoices([]);
    setBrandBible(null);
  };

  const renderContent = () => {
    switch (stage) {
      case 'mission':
        return <MissionStage mission={mission} setMission={setMission} companyName={companyName} setCompanyName={setCompanyName} onSubmit={handleMissionSubmit} />;
      case 'names':
        return <NameSuggestionStage suggestions={nameSuggestions} domainStatus={domainStatus} domainChecks={domainChecks} selectedTld={selectedTld} tldOptions={TLD_OPTIONS} setSelectedTld={(tld) => { setSelectedTld(tld); setDomainStatus('idle'); setDomainChecks({}); }} onCheckAvailability={handleCheckAvailability} onNameSelect={handleNameSelection} onRegenerate={handleSuggestNames} isLoading={isLoading} selectedName={companyName} setSelectedName={setCompanyName} onBack={() => setStage('mission')} />;
      case 'voice':
        return <VoiceSelectionStage brandVoices={brandVoices} selectedName={companyName} onSelectVoice={(voice) => handleGenerateBrand(companyName, voice)} onSkip={() => handleGenerateBrand(companyName, undefined)} />;
      case 'generating':
        return <GeneratingStage message={progressMessage} />;
      case 'done':
        if (!brandBible) return null;
        return <BrandBibleDisplay brandBible={brandBible} mission={mission} selectedName={companyName} isAuthenticated={isAuthenticated} isSaving={isSaving} onDownload={handleDownload} onStartOver={handleStartOver} onSave={handleSaveBrand} onOpenRegenerateModal={handleOpenRegenerateModal} isRegenerating={isRegenerating} regenerationRequest={regenerationRequest} />;
      default:
        return null;
    }
  };
  
  return (
    <>
      {renderContent()}
      <RegenerateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleRegenerate} title={regenerationRequest?.title || "Regenerate"} isLoading={isRegenerating} />
    </>
  );
};