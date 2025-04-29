import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <div className={`relative ${className}`} style={{ width: sizeMap[size], height: sizeMap[size] }}>
      <Image
        src="/logo.png"
        alt="Bhaag Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo; 