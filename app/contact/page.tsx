import { Legal } from '@/components/Legal';

export const metadata = { title: 'Contact – TubeVault' };

export default function Page() {
  const wa = process.env.ADMIN_WHATSAPP?.replace(/\D/g, '');
  const email = process.env.ADMIN_EMAIL;
  return (
    <Legal title="Contact">
      <p>For support, billing, DMCA or legal enquiries, reach us using any channel below.</p>
      <ul className="list-disc space-y-2 pl-6">
        {email && <li>Email: <a className="text-brand underline" href={`mailto:${email}`}>{email}</a></li>}
        {wa && <li>WhatsApp: <a className="text-brand underline" href={`https://wa.me/${wa}`}>wa.me/{wa}</a></li>}
        <li>Logged-in members: use the <a className="text-brand underline" href="/support">Support</a> page or the live chat button.</li>
      </ul>
    </Legal>
  );
}
