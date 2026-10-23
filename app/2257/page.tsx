import { Legal } from '@/components/Legal';

export const metadata = { title: '18 U.S.C. 2257 Statement – TubeVault' };

export default function Page() {
  return (
    <Legal title="18 U.S.C. § 2257 Compliance Statement">
      <p>TubeVault is not a producer of any visual content. All content is embedded from third-party websites, and TubeVault does not host, store or upload such material.</p>
      <p>Records required under 18 U.S.C. § 2257 and 28 C.F.R. Part 75 are maintained by the respective producers and hosting providers of the embedded content. Inquiries regarding records should be directed to the original source.</p>
      <p>TubeVault has a zero-tolerance policy toward illegal content. Report any concerns via the <a className="text-brand underline" href="/contact">Contact</a> page.</p>
    </Legal>
  );
}
