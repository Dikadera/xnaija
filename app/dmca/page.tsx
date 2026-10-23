import { Legal } from '@/components/Legal';

export const metadata = { title: 'DMCA – TubeVault' };

export default function Page() {
  return (
    <Legal title="DMCA / Copyright Policy">
      <p>TubeVault does not host video files. Content is embedded from third-party providers. We respect intellectual property rights and respond to valid notices under the Digital Millennium Copyright Act.</p>
      <p>To file a takedown notice, email the address on our <a className="text-brand underline" href="/contact">Contact</a> page with: (1) identification of the copyrighted work; (2) the URL of the infringing page; (3) your contact details; (4) a statement of good-faith belief; (5) a statement under penalty of perjury that you are authorised to act; and (6) your physical or electronic signature.</p>
      <p>Notices should also be sent to the original hosting provider, as removal at the source removes the embed.</p>
    </Legal>
  );
}
