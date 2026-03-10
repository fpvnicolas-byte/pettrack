import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

// Mapeamento plano → Stripe Price ID (definidos no .env)
export const STRIPE_PRICE_IDS: Record<string, string> = {
  BASICO: process.env.STRIPE_PRICE_BASICO ?? '',
  PROFISSIONAL: process.env.STRIPE_PRICE_PROFISSIONAL ?? '',
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM ?? '',
};
