import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register';

const GoogleIcon = () => (
  <svg className="w-5 h-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 266.1 0 129.9 109.8 21.8 244 21.8c65.6 0 123.3 24.2 166.3 64.9l-67.5 64.9C291.5 118.8 244 104.6 244 104.6c-79.6 0-144.3 64.7-144.3 144.3s64.7 144.3 144.3 144.3c88.4 0 112.8-62.3 116.3-93.1H244v-75.9h244.5c1.4 8.5 2.1 17.3 2.1 26.3z"></path>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
  </svg>
);


export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginWithProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (view === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose(); // Close modal on success
    } catch (err) {
      // Error is already shown by the AuthContext, but we keep the modal open.
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
        await loginWithProvider(provider);
        onClose();
    } catch (err) {
        // Error already shown by context
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setEmail('');
    setPassword('');
    setView('login');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex border-b border-gray-700">
          <button onClick={() => setView('login')} className={`flex-1 p-4 font-bold transition-colors ${view === 'login' ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:bg-gray-700/20'}`}>Login</button>
          <button onClick={() => setView('register')} className={`flex-1 p-4 font-bold transition-colors ${view === 'register' ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:bg-gray-700/20'}`}>Sign Up</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                />
            </div>
            <div>
                <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
          </div>
          <div className="bg-gray-700/50 px-6 py-4 rounded-b-xl">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !email || !password}
              className="w-full"
            >
              {view === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="p-6 pt-0">
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">OR</span>
                </div>
            </div>
            <div className="space-y-3">
                <Button
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    variant="secondary"
                    className="w-full gap-3"
                >
                    <GoogleIcon />
                    Continue with Google
                </Button>
                <Button
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                    variant="secondary"
                    className="w-full gap-3"
                >
                    <FacebookIcon />
                    Continue with Facebook
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
};