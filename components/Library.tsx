import React, { useEffect, useState } from 'react';
import type { BrandBible, SavedBrand } from '../types';
import * as apiService from '../services/apiService';
import { useError } from '../contexts/ErrorContext';

interface LibraryProps {
  onSelectBrand: (brand: BrandBible) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export const Library: React.FC<LibraryProps> = ({ onSelectBrand }) => {
  const [brands, setBrands] = useState<SavedBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const userBrands = await apiService.getUserBrands();
        setBrands(userBrands);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to load your library.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, [showError]);
  
  const handleSelect = async (brandId: string) => {
      try {
        const fullBrand = await apiService.getBrandById(brandId);
        onSelectBrand(fullBrand);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to load brand details.");
      }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">My Brand Library</h2>
        <p className="text-lg text-gray-400">Here are all the brand identities you've saved. Click one to view or edit.</p>
      </div>
      {brands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brands.map(brand => (
            <button 
              key={brand.id} 
              onClick={() => handleSelect(brand.id)}
              className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 flex flex-col text-left group overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-full h-40 flex items-center justify-center p-4" style={{ backgroundColor: brand.primaryColor || '#1A202C' }}>
                <img src={brand.primaryLogoUrl} alt={`${brand.companyName} logo`} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <div className="p-4 bg-gray-800">
                <h3 className="text-xl font-bold text-white truncate">{brand.companyName}</h3>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-800 rounded-lg max-w-lg mx-auto border border-gray-700">
          <h3 className="text-2xl font-bold text-white">Your library is empty.</h3>
          <p className="text-gray-400 mt-2">Go to the Generator to create and save your first brand identity!</p>
        </div>
      )}
    </div>
  );
};
