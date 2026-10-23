'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import VideoGrid from '@/components/VideoGrid';

const TABS = [
  { slug: 'nigerian', label: 'Nigerian' },
  { slug: 'african', label: 'African' },
  { slug: 'amateur', label: 'Amateur' },
  { slug: 'mixed', label: 'Mixed' },
];

function Home() {
  const sp = useSearchParams();
  const q = sp.get('q') || '';
  const cat = sp.get('cat') || 'nigerian';
  const label = TABS.find((t) => t.slug === cat)?.label || 'Nigerian';
  return (
    <>
      {!q && (
        <nav className="mb-5 flex flex-wrap gap-2" aria-label="Categories">
          {TABS.map((t) => (
            <Link
              key={t.slug}
              id={`cat-${t.slug}`}
              href={t.slug === 'nigerian' ? '/' : `/?cat=${t.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${cat === t.slug ? 'border-brand bg-brand text-white' : 'border-line text-zinc-300 hover:border-brand/50'}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
      <h1 className="mb-5 text-2xl font-bold">{q ? `Results for “${q}”` : `🔥 ${label} videos`}</h1>
      <VideoGrid endpoint={q ? 'search' : 'trending'} q={q} category={cat} />
    </>
  );
}

export default function Page() {
  return <Suspense><Home /></Suspense>;
}
