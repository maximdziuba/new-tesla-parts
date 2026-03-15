import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

const ShopLogo = () => {
  const { theme } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Link href="/" className="flex items-center group">
      <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-105 h-20 md:h-28 overflow-hidden">
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
