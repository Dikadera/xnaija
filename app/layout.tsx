import './globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import AgeGate from '@/components/AgeGate';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportWidgets from '@/components/SupportWidgets';

export const metadata: Metadata = {
  title: 'TubeVault – Premium 18+ Video Library',
  description: 'Adults-only (18+) premium video subscription. Embedded third-party content.',
  robots: { index: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AgeGate>
          <AuthProvider>
            <Header />
            <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6">{children}</main>
            <Footer />
            <SupportWidgets tawk={process.env.TAUK_TO_ID} whatsapp={process.env.ADMIN_WHATSAPP} />
          </AuthProvider>
        </AgeGate>
      </body>
    </html>
  );
}
