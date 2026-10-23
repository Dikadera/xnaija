'use client';
import Script from 'next/script';
import { MessageCircle } from 'lucide-react';

export default function SupportWidgets({ tawk, whatsapp }: { tawk?: string; whatsapp?: string }) {
  return (
    <>
      {tawk && (
        <Script id="tawk" strategy="lazyOnload">{`var Tawk_API=Tawk_API||{};(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src='https://embed.tawk.to/${tawk}';s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();`}</Script>
      )}
      {whatsapp && (
        <a id="whatsapp-btn" href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp support"
          className="fixed bottom-24 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-110">
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </>
  );
}
