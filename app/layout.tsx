import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
