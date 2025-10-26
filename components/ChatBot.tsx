import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatBotProps } from '../types';
import { useError } from '../contexts/ErrorContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

// Helper to read a file and convert it to the necessary base64 formats
const readFileAsBase64 = (file: File): Promise<{ data: string; dataUrl: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // The API needs just the base64 part, without the data URL prefix
      const data = dataUrl.split(',')[1];
      resolve({ data, dataUrl, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const ChatBot: React.FC<ChatBotProps> = ({ chatSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ data: string; dataUrl: string; mimeType: string } | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useError();

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        try {
            const imageData = await readFileAsBase64(file);
            setAttachedImage(imageData);
        } catch (error) {
            showError("Failed to read the image file.");
        }
    }
    // Clear the input value to allow selecting the same file again
    if (event.target) event.target.value = '';
  };

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || !chatSession) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      text: input, 
      sender: 'user',
      imageUrl: attachedImage?.dataUrl,
    };
    setMessages(prev => [...prev, userMessage]);

    // Capture state before clearing it for the async operation
    const textToSend = input;
    const imageToSend = attachedImage;
    
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: 'bot' }]);
    
    try {
      const stream = await chatSession.sendMessageStream({ 
        message: textToSend,
        image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : undefined,
      });
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: msg.text + chunkText } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      showError(error instanceof Error ? error.message : "An unknown chat error occurred.");
      // Remove the placeholder bot message on error
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [input, chatSession, showError, attachedImage]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><BotIcon /></div>}
            <div className={`p-4 rounded-xl max-w-md ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              {msg.imageUrl && <img src={msg.imageUrl} alt="User attachment" className="mb-2 rounded-lg max-w-xs" />}
              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
              {isLoading && msg.sender === 'bot' && !msg.text && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
            </div>
             {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700">
        {attachedImage && (
            <div className="relative w-24 h-24 mb-2 p-1 border border-gray-600 rounded-md bg-gray-900">
                <img src={attachedImage.dataUrl} alt="Preview" className="w-full h-full object-cover rounded" />
                <button 
                    onClick={() => setAttachedImage(null)} 
                    className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 border-2 border-gray-800 hover:bg-red-500 transition-colors"
                    aria-label="Remove attached image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-4">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button 
            type="button" 
            variant="secondary"
            size="icon"
            onClick={() => fileInputRef.current?.click()} 
            disabled={isLoading || !!attachedImage}
            aria-label="Attach image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Button>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a branding question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !attachedImage)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
};