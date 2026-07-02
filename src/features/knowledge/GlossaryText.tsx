import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findKnowledge } from '../../data/knowledge';
import { segmentText } from './glossary';

type Props = {
  children: string;
  className?: string;
};

function GlossaryTerm({ id, text }: { id: string; text: string }) {
  const [hover, setHover] = useState(false);
  const node = findKnowledge(id);

  return (
    <span
      className="relative inline"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to={`/knowledge?node=${id}`}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="font-medium text-electric underline decoration-dotted decoration-electric/50 underline-offset-2 transition-colors hover:decoration-electric focus:outline-none focus-visible:ring-2 focus-visible:ring-electric/60"
      >
        {text}
      </Link>
      {hover && node && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 block w-64 -translate-x-1/2 rounded-xl border border-electric/25 bg-graphite/95 p-3 text-left shadow-panel backdrop-blur-md"
        >
          <span className="block text-sm font-semibold text-slate-50">{node.title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-300">{node.summary}</span>
          <span className="mt-2 block text-[11px] font-semibold text-electric">Открыть в базе знаний →</span>
        </span>
      )}
    </span>
  );
}

// Рендерит текст, подсвечивая известные термины. При наведении — краткая
// сводка из базы знаний (не надо открывать статью целиком), клик — переход.
export function GlossaryText({ children, className }: Props) {
  const segments = segmentText(children);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (!segment.id) return <span key={index}>{segment.text}</span>;
        return <GlossaryTerm key={index} id={segment.id} text={segment.text} />;
      })}
    </span>
  );
}
