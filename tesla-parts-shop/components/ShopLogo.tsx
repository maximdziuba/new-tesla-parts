import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

interface ShopLogoProps {
  compact?: boolean;
}

const ShopLogo: React.FC<ShopLogoProps> = ({ compact = false }) => {
  const { theme } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Link href="/" className="flex items-center group">
      <div
        className={`flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 ${
          compact ? 'h-14 md:h-16' : 'h-20 md:h-28'
        }`}
      >
        {isMounted && (
          <img 
            src={theme === 'dark' ? "/tesla-fix_dark.png" : "/tesla-fix.png"} 
            alt="TeslaFix Logo" 
            className="h-full w-auto object-contain transform scale-125"
          />
        )}
      </div>
    </Link>
  );
};

export default ShopLogo;
