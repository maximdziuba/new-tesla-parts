'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [ordered, setOrdered] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrdered(true);
    clearCart();
  };

  if (ordered) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 style={{ color: 'var(--primary-accent)', marginBottom: '1rem' }}>Дякуємо за замовлення!</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--primary-text)' }}>Наш менеджер зв'яжеться з вами найближчим часом.</p>
        <Link href="/" className="btn">На головну</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary-text)' }}>Кошик порожній</h1>
        <Link href="/" className="btn">До магазину</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Breadcrumbs items={[{ label: 'Оформлення замовлення' }]} />
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary-text)' }}>Оформлення замовлення</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-text)' }}>Ваше замовлення</h2>
          <ul style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', background: 'var(--main-background)' }}>
            {cart.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-text)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.quantity} x {formatPrice(item.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '1rem', color: 'var(--primary-text)' }}>{formatPrice(item.price * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--primary-accent)', border: 'none', background: 'none', fontWeight: 'bold' }}>✕</button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-text)' }}>
            Всього: {formatPrice(totalPrice)}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-text)' }}>Контактні дані</h2>
          <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--primary-text)' }}>Ім'я</label>
              <input required type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--primary-text)' }}>Телефон</label>
              <input required type="tel" placeholder="+380..." style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--primary-text)' }}>Місто та відділення НП</label>
              <textarea required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} rows={3}></textarea>
            </div>
            <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Підтвердити замовлення</button>
          </form>
        </section>
      </div>
    </div>
  );
}
