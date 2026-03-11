'use client';

import React, { createContext, useContext, useState } from 'react';

type Currency = 'UAH' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInUah: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const USD_RATE = 40; // Mock exchange rate

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('UAH');

  const formatPrice = (priceInUah: number) => {
    if (currency === 'USD') {
      const price = priceInUah / USD_RATE;
      return `$${price.toFixed(2)}`;
    }
    return `${priceInUah} грн`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
