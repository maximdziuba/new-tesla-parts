import { Currency } from '../types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const truncatedAmount = Math.floor(amount);
  
  // Custom formatter to ensure identical output on Server and Client
  // to prevent hydration mismatches (Next.js)
  
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  if (currency === Currency.UAH) {
    return `${formatNumber(truncatedAmount)} грн`;
  }
  
  if (currency === Currency.USD) {
    return `$${formatNumber(truncatedAmount)}`;
  }

  return `${formatNumber(truncatedAmount)} ${currency}`;
};
