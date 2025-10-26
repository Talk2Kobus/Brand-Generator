import React, { useState, useEffect } from 'react';
import { BrandGenerator } from './components/BrandGenerator';
import { ChatBot } from './components/ChatBot';
import { Library } from './components/Library';
import { Analytics } from './components/Analytics';
import { AuthModal } from './components/auth/AuthModal';
import type { BrandBible } from './types';
import { createChat } from './services/aiService';
import { useError } from './contexts/ErrorContext';
import { ErrorToast } from './components/ErrorToast';
import { useAuth } from './contexts/AuthContext';


type View = 'generator' | 'chat' | 'library' | 'analytics';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('generator');
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandBible | null>(null);
  const { error, hideError } = useError();
  const { isAuthenticated, user, logout } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  const chatSession = createChat();

  useEffect(() => {
    if (brandBible?.fontPairing) {
      const { header, body } = brandBible.fontPairing;
      const fontUrl = `https://fonts.googleapis.com/css2?family=${header.replace(/ /g, '+')}:wght@700&family=${body.replace(/ /g, '+')}:wght@400;500&display=swap`;
      
      let link = document.getElementById('google-fonts') as HTMLLinkElement;
      if (link) {
        link.href = fontUrl;
      } else {
        link = document.createElement('link');
        link.id = 'google-fonts';
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }
  }, [brandBible]);

  const handleSelectBrand = (brand: BrandBible) => {
    setEditingBrand(brand);
    setActiveView('generator');
  };

  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeView === view
          ? 'bg-cyan-500 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const renderView = () => {
    switch(activeView) {
      case 'generator':
        return <BrandGenerator onBrandGenerated={setBrandBible} initialBrand={editingBrand} setInitialBrand={setEditingBrand}/>;
      case 'chat':
        return <ChatBot chatSession={chatSession} />;
      case 'library':
        return <Library onSelectBrand={handleSelectBrand} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <BrandGenerator onBrandGenerated={setBrandBible} initialBrand={editingBrand} setInitialBrand={setEditingBrand}/>;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {error && <ErrorToast message={error} onDismiss={hideError} />}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <svg className="h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <h1 className="ml-3 text-xl font-bold text-white">Brand Identity Generator</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <nav className="flex items-center space-x-2">
                        <NavButton view="generator" label="Generator" />
                        <NavButton view="chat" label="AI Chat" />
                        {isAuthenticated && <NavButton view="library" label="My Library" />}
                        {isAuthenticated && <NavButton view="analytics" label="Analytics" />}
                    </nav>
                    <div className="w-px h-6 bg-gray-600 mx-2"></div>
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-300 hidden sm:block">Welcome!</span>
                             <button onClick={logout} className="px-3 py-2 text-sm font-medium bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Logout</button>
                        </div>
                    ) : (
                        <button onClick={() => setAuthModalOpen(true)} className="px-3 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                            Login / Sign Up
                        </button>
                    )}
                </div>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
}


const App: React.FC = () => {
  return (
      <AppContent />
  );
};

export default App;