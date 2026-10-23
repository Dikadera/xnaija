'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import VideoGrid from '@/components/VideoGrid';
import { Button } from '@/components/ui/button';

export default function VideoPage({ params }: { params: { id: string } }) {
  const { user, loading, api } = useAuth();
  const [embed, setEmbed] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'locked'>('loading');
  const [title, setTitle] = useState('');

  useEffect(() => { setTitle(new URLSearchParams(window.location.search).get('t') || ''); }, [params.id]);

  useEffect(() => {
    if (loading) return;
    setState('loading');
    api(`/api/video/${params.id}`).then(async (r) => {
      if (r.ok) { setEmbed((await r.json()).embedUrl); setState('ok'); } else setState('locked');
    });
  }, [loading, user, params.id, api]);

  return (
    <div className="space-y-8">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
        {state === 'ok' && embed && (
          <iframe src={embed} title="Video player" className="absolute inset-0 h-full w-full" allowFullScreen scrolling="no" frameBorder={0} />
        )}
        {state !== 'ok' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[url('/placeholder.svg')] bg-cover bg-center p-6 text-center">
            <div className="absolute inset-0 backdrop-blur-2xl bg-black/60" />
            {state === 'locked' && (
              <div className="relative">
                <Lock className="mx-auto mb-3 h-10 w-10 text-gold" />
                <h1 className="text-2xl font-bold">Subscribe to watch</h1>
                <p className="mt-1 text-sm text-zinc-400">{user ? 'Your plan is inactive or expired.' : 'Log in and pick a plan to unlock this video.'}</p>
                <div className="mt-5 flex justify-center gap-3">
                  <Link href="/pricing"><Button variant="gold">View plans</Button></Link>
                  {!user && <Link href={`/login?next=/video/${params.id}`}><Button variant="outline">Log in</Button></Link>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {state === 'ok' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">{title || `Video ${params.id}`}</h1>
          <Link id="remove-video-link" href={`/remove-video?id=${params.id}`} className="text-sm text-zinc-400 underline hover:text-brand">Remove video</Link>
        </div>
      )}
      {state === 'ok' && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Related videos</h2>
          <VideoGrid endpoint="trending" />
        </section>
      )}
    </div>
  );
}
