import { Legal } from '@/components/Legal';

export const metadata = { title: 'Privacy – TubeVault' };

export default function Page() {
  return (
    <Legal title="Privacy Policy">
      <p>We collect your email address (via Firebase Authentication), subscription status and any support messages you send. Payments are processed by a third-party crypto provider; we do not store wallet keys or card data.</p>
      <p>Your age confirmation is stored only in your browser (localStorage). We use caching and rate limiting that may process your IP address transiently. Third-party embeds and the support chat widget may set their own cookies.</p>
      <p>We do not sell personal data. Request deletion via the Contact page.</p>
      <p className="text-sm text-zinc-500">Template text – have it reviewed by counsel before launch.</p>
    </Legal>
  );
}
