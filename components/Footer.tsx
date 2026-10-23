import Link from 'next/link';

const links = [
  ['/remove-video', 'Remove video'],
  ['/dmca', 'DMCA'],
  ['/2257', '2257 Statement'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/contact', 'Contact'],
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-black/40 px-4 py-10 text-center text-sm text-zinc-500">
      <nav className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {links.map(([h, l]) => (
          <Link key={h} href={h} className="hover:text-white">{l}</Link>
        ))}
      </nav>
      <p className="mx-auto max-w-2xl">All models appearing on this site were 18 years or older at the time of production. TubeVault does not host any video files; content is embedded from third-party providers.</p>
      <p className="mt-3">© {new Date().getFullYear()} TubeVault. 18+ only.</p>
    </footer>
  );
}
