'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Checkout from '../../components/Checkout';
import { useApp } from '../../context/AppContext';

export default function CheckoutPage() {
  const { cart, currency, uahPerUsd, cartTotalUSD, clearCart } = useApp();
  const router = useRouter();

  const handleSuccess = () => {
    clearCart();
    router.push('/success');
  };

  return (
    <Checkout
      cartItems={cart}
      currency={currency}
      uahPerUsd={uahPerUsd}
      totalUSD={cartTotalUSD}
      onSuccess={handleSuccess}
    />
  );
}
