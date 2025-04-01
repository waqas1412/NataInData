import React from 'react';

interface CircularLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const CircularLoader: React.FC<CircularLoaderProps> = ({ 
  size = 'md', 
  color = 'primaryColor' 
}) => {
  // Determine size based on prop
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }[size];
  
  // Determine color based on prop
  const borderColor = color === 'primaryColor' 
    ? 'border-primaryColor/30 border-t-primaryColor' 
    : `border-${color}-300 border-t-${color}-600`;

  return (
    <div 
      className={`${sizeClass} ${borderColor} rounded-full animate-spin`}
      aria-label="Loading"
    />
  );
};

export default CircularLoader; 