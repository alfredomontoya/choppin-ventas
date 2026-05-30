import type { ReactNode } from 'react';

export default function HighlightText({ text, query }: { text: string | ReactNode; query: string }) {
  if (!query || typeof text !== 'string') return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const partes = text.split(regex);

  return (
    <>
      {partes.map((parte, i) =>
        regex.test(parte)
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">{parte}</mark>
          : parte
      )}
    </>
  );
}
