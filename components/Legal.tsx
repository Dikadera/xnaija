export const Legal = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <article className="mx-auto max-w-3xl space-y-4 text-zinc-300">
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    {children}
  </article>
);
