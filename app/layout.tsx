import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VetTrack — Acompanhamento em Tempo Real',
  description: 'Sistema de acompanhamento de atendimentos veterinários com notificação via WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${quicksand.variable}`}>
      <body className="font-sans antialiased bg-[#f8f9fc] text-vettrack-dark">{children}</body>
    </html>
  );
}
