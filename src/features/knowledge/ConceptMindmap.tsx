import { motion } from 'framer-motion';
import { knowledgeNodes } from '../../data/knowledge';
import type { KnowledgeNode } from '../../entities/schemas';

// Локальный mindmap: в центре выбранное понятие, радиально — его прямые связи.
// Ветки идут только из центра → пересечений нет по построению. Клик по ветке
// перецентровывает карту. Анимации — framer-motion.

const relationColor: Record<string, string> = {
  prerequisite: '#8b7bff',
  related: '#b3a4ff',
  used_in: '#57d9a3',
  common_mistake: '#ff7a93',
  example: '#ffce6a',
  contrasts_with: '#f472b6'
};

const W = 880;
const H = 460;
const CX = W / 2;
const CY = H / 2;
const RX = 330;
const RY = 168;

function wrapTitle(title: string): string[] {
  if (title.length <= 14 || !title.includes(' ')) return [title];
  const words = title.split(' ');
  const half = title.length / 2;
  let first = '';
  let i = 0;
  while (i < words.length && (first === '' || first.length < half)) {
    first = first ? `${first} ${words[i]}` : words[i];
    i++;
  }
  const second = words.slice(i).join(' ');
  return second ? [first, second] : [first];
}

function chipSize(lines: string[], big = false) {
  const maxLen = Math.max(...lines.map((line) => line.length));
  const w = Math.min(big ? 210 : 188, Math.max(big ? 130 : 96, maxLen * (big ? 8.6 : 7.3) + 26));
  const h = (lines.length > 1 ? 50 : 38) + (big ? 6 : 0);
  return { w, h };
}

type Props = {
  node: KnowledgeNode;
  onSelect: (id: string) => void;
};

type Neighbor = { relation: string; target: KnowledgeNode };

export function ConceptMindmap({ node, onSelect }: Props) {
  const neighbors: Neighbor[] = node.related
    .map((relation) => {
      const target = knowledgeNodes.find((n) => n.id === relation.id);
      return target ? { relation: relation.relation as string, target } : undefined;
    })
    .filter((item): item is Neighbor => item !== undefined)
    .slice(0, 8);

  const count = Math.max(neighbors.length, 1);
  const placed = neighbors.map((item, index) => {
    const angle = ((-90 + (360 / count) * index) * Math.PI) / 180;
    const x = CX + RX * Math.cos(angle);
    const y = CY + RY * Math.sin(angle);
    return { ...item, x, y };
  });

  const centerLines = wrapTitle(node.title);
  const center = chipSize(centerLines, true);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={`Карта связей: ${node.title}`}
      style={{ display: 'block', height: 'auto', fontFamily: 'inherit' }}
    >
      {/* Рёбра-ветки */}
      {placed.map((item, index) => {
        const mx = (CX + item.x) / 2;
        const my = (CY + item.y) / 2;
        const dx = item.x - CX;
        const dy = item.y - CY;
        const len = Math.hypot(dx, dy) || 1;
        const off = 22;
        const cxp = mx + (-dy / len) * off;
        const cyp = my + (dx / len) * off;
        const color = relationColor[item.relation] ?? '#8b7bff';
        return (
          <motion.path
            key={`edge-${node.id}-${item.target.id}`}
            d={`M ${CX} ${CY} Q ${cxp} ${cyp} ${item.x} ${item.y}`}
            fill="none"
            stroke={color}
            strokeWidth={1.6}
            strokeOpacity={0.7}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.08 + index * 0.05, ease: 'easeOut' }}
          />
        );
      })}

      {/* Соседние понятия */}
      {placed.map((item, index) => {
        const lines = wrapTitle(item.target.title);
        const { w, h } = chipSize(lines);
        const color = relationColor[item.relation] ?? '#8b7bff';
        return (
          <motion.g
            key={`node-${node.id}-${item.target.id}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.18 + index * 0.05, ease: 'backOut' }}
            whileHover={{ scale: 1.06 }}
            style={{ cursor: 'pointer', transformBox: 'fill-box', transformOrigin: 'center' }}
            onClick={() => onSelect(item.target.id)}
          >
            <rect x={item.x - w / 2} y={item.y - h / 2} width={w} height={h} rx={12} fill="#1c1830" stroke={color} strokeWidth={1.5} />
            <circle cx={item.x - w / 2 + 12} cy={item.y - h / 2 + 12} r={3} fill={color} />
            {lines.map((line, lineIndex) => (
              <text
                key={line}
                x={item.x}
                y={item.y + (lines.length > 1 ? (lineIndex === 0 ? -5 : 13) : 4)}
                textAnchor="middle"
                fill="#e7e3f7"
                fontSize={12.5}
                fontWeight={600}
              >
                {line}
              </text>
            ))}
          </motion.g>
        );
      })}

      {/* Центр — выбранное понятие */}
      <motion.g
        key={`center-${node.id}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'backOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <rect
          x={CX - center.w / 2}
          y={CY - center.h / 2}
          width={center.w}
          height={center.h}
          rx={14}
          fill="rgba(139,123,255,0.18)"
          stroke="#8b7bff"
          strokeWidth={2}
        />
        {centerLines.map((line, lineIndex) => (
          <text
            key={line}
            x={CX}
            y={CY + (centerLines.length > 1 ? (lineIndex === 0 ? -4 : 15) : 5)}
            textAnchor="middle"
            fill="#cdc4ff"
            fontSize={14.5}
            fontWeight={800}
          >
            {line}
          </text>
        ))}
      </motion.g>
    </svg>
  );
}
