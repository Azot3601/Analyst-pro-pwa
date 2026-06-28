import { Link } from 'react-router-dom';
import { findKnowledge } from '../../data/knowledge';
import { segmentText } from './glossary';

type Props = {
  children: string;
  className?: string;
};

// Рендерит текст, подсвечивая известные термины ссылкой в базу знаний.
// Безопасен для inline-вставки внутрь <p>/<span>.
export function GlossaryText({ children, className }: Props) {
  const segments = segmentText(children);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (!segment.id) return <span key={index}>{segment.text}</span>;
        const node = findKnowledge(segment.id);
        return (
          <Link
            key={index}
            to={`/knowledge?node=${segment.id}`}
            title={node ? node.summary : 'Открыть в базе знаний'}
            className="font-medium text-electric underline decoration-dotted decoration-electric/50 underline-offset-2 transition-colors hover:decoration-electric focus:outline-none focus-visible:ring-2 focus-visible:ring-electric/60"
          >
            {segment.text}
          </Link>
        );
      })}
    </span>
  );
}
