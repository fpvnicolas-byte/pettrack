import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vettrack.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'VetTrack — Acompanhamento em Tempo Real para Clínicas Veterinárias',
    template: '%s | VetTrack',
  },
  description:
    'Notifique tutores automaticamente via WhatsApp a cada etapa do atendimento veterinário. Sem app, sem complicação. Ideal para clínicas e pet shops.',
  keywords: [
    'veterinário',
    'clínica veterinária',
    'pet shop',
    'notificação WhatsApp',
    'acompanhamento de atendimento',
    'sistema veterinário',
    'SaaS veterinário',
    'VetTrack',
  ],
  authors: [{ name: 'VetTrack' }],
  creator: 'VetTrack',
  publisher: 'VetTrack',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: appUrl,
    siteName: 'VetTrack',
    title: 'VetTrack — Acompanhamento em Tempo Real para Clínicas Veterinárias',
    description:
      'Notifique tutores automaticamente via WhatsApp a cada etapa do atendimento. Sem app, sem complicação.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VetTrack — Acompanhamento em Tempo Real para Clínicas Veterinárias',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VetTrack — Acompanhamento em Tempo Real para Clínicas Veterinárias',
    description:
      'Notifique tutores automaticamente via WhatsApp a cada etapa do atendimento. Sem app, sem complicação.',
    images: ['/og-image.png'],
    creator: '@vettrack',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${quicksand.variable} scroll-smooth scroll-pt-20`}>
      <body className="font-sans antialiased bg-[#f8f9fc] text-vettrack-dark">{children}</body>
    </html>
  );
}
