import { cacheGet, cacheSet } from './redis';
import { db } from './admin';

export type Video = { id: string; title: string; thumb: string; duration: string; embedUrl: string; category?: string };

/** Homepage categories. `nigerian` is the main/default one; `mixed` is the all-round trending feed. */
export const CATEGORIES = [
  { slug: 'nigerian', label: 'Nigerian', keyword: 'nigerian' },
  { slug: 'african', label: 'African', keyword: 'african' },
  { slug: 'amateur', label: 'Amateur', keyword: 'amateur' },
  { slug: 'mixed', label: 'Mixed', keyword: '' },
] as const;

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Drops repeats by id and by normalized title. */
export function dedupe(list: Video[]): Video[] {
  const ids = new Set<string>();
  const titles = new Set<string>();
  return list.filter((v) => {
    const t = norm(v.title);
    if (ids.has(v.id) || (t && titles.has(t))) return false;
    ids.add(v.id);
    if (t) titles.add(t);
    return true;
  });
}

/** Video ids taken down through the removal-request page. */
async function removedIds(): Promise<Set<string>> {
  try {
    const hit = await cacheGet('removed_ids');
    if (hit) return new Set(hit as string[]);
    const s = await db().collection('removed_videos').get();
    const ids = s.docs.map((d) => d.id);
    await cacheSet('removed_ids', ids as any, 60);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

const BASE = process.env.VIDEO_SOURCE_BASE || 'https://www.xvideos.com';
const embed = (id: string) => `https://www.xvideos.com/embedframe/${id}`;

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Best-effort listing parser: extracts ONLY id/title/thumb/duration. Adjust to your source. */
function parse(html: string): Video[] {
  const out: Video[] = [];
  const blocks = html.split(/<div id="video_/).slice(1);
  for (const b of blocks) {
    const id = b.match(/^(\w+)/)?.[1];
    const title = b.match(/<p class="title"[^>]*>\s*<a[^>]*title="([^"]+)"/)?.[1] || b.match(/title="([^"]+)"/)?.[1];
    const thumb = b.match(/data-src="([^"]+)"/)?.[1];
    const duration = b.match(/<span class="duration">([^<]+)</)?.[1]?.trim() || '';
    if (id && title && thumb)
      out.push({ id, title: decode(title), thumb, duration, embedUrl: embed(id) });
  }
  return out;
}

function demo(page: number, label: string): Video[] {
  return Array.from({ length: 24 }, (_, i) => {
    const n = page * 24 + i + 1;
    return {
      id: String(1000000 + n),
      title: `${label || 'Mixed'} Premium Video #${n}`,
      thumb: '/placeholder.svg',
      duration: `${5 + (n % 40)} min`,
      embedUrl: embed(String(1000000 + n)),
    };
  });
}

export async function getVideos(kind: 'search' | 'trending', q: string, page: number, category = 'nigerian'): Promise<Video[]> {
  const cat = CATEGORIES.find((c) => c.slug === category) || CATEGORIES[0];
  const key = `v:${kind}:${cat.slug}:${q.toLowerCase()}:${page}`;
  let list: Video[] = (await cacheGet(key)) || [];
  if (!list.length) {
    try {
      const term = q || cat.keyword;
      const url = term ? `${BASE}/?k=${encodeURIComponent(term)}&p=${page}` : `${BASE}/best/${new Date().toISOString().slice(0, 7)}/${page}`;
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 TubeVault' }, cache: 'no-store' });
      if (res.ok) list = parse(await res.text());
    } catch {}
    if (!list.length) list = demo(page, cat.label); // placeholder fallback if source unreachable/unparseable
    list = dedupe(list).map((v) => ({ ...v, category: cat.slug }));
    await cacheSet(key, list, 7200); // 2h TTL
  }
  const removed = await removedIds();
  return list.filter((v) => !removed.has(v.id));
}
