import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700 ${className}`}>
      {children}
    </div>
  );
};