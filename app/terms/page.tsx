import { Legal } from '@/components/Legal';

export const metadata = { title: 'Terms – TubeVault' };

export default function Page() {
  return (
    <Legal title="Terms of Service">
      <p>You must be at least 18 years old (or the age of majority where you live) to use this site. By using it you confirm that viewing adult material is legal in your jurisdiction.</p>
      <p>Subscriptions grant personal, non-transferable access for the paid period. Crypto payments are generally non-refundable once confirmed. Accounts shared or abused may be suspended.</p>
      <p>Embedded content belongs to its respective owners and is provided “as is”. We may change or discontinue the service at any time.</p>
      <p className="text-sm text-zinc-500">Template text – have it reviewed by counsel before launch.</p>
    </Legal>
  );
}
