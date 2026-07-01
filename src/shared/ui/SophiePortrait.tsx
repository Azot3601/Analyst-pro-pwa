import { motion } from 'framer-motion';
import { useAppStore } from '../../app/store';

// Софи, Чтица свитков — стильный, тактичный SVG-портрет эльфийки-наставницы.
// Состояния меняют выражение лица; анимации (дыхание, свет лампы, искры)
// уважают настройку «меньше анимаций».

export type SophieState = 'idle' | 'happy' | 'encouraging' | 'thinking' | 'hint' | 'proud';

const skin = '#f1d9c3';
const skinShade = '#e6c2a4';
const hairLight = '#d7cffb';
const hairMid = '#b3a4ff';
const hairDeep = '#8b7bff';

function Eyes({ state }: { state: SophieState }) {
  if (state === 'happy' || state === 'proud') {
    // Закрытые улыбающиеся глаза — дуги.
    return (
      <g stroke="#3a2f4a" strokeWidth={2.4} strokeLinecap="round" fill="none">
        <path d="M78 96 q7 -7 14 0" />
        <path d="M108 96 q7 -7 14 0" />
      </g>
    );
  }
  const narrow = state === 'encouraging';
  const lookX = state === 'hint' ? 1.5 : 0;
  return (
    <g>
      <ellipse cx={85} cy={98} rx={6.5} ry={narrow ? 5 : 7.5} fill="#fdfbff" />
      <ellipse cx={115} cy={98} rx={6.5} ry={narrow ? 5 : 7.5} fill="#fdfbff" />
      <circle cx={85 + lookX} cy={99} r={3.4} fill="#5b4bb0" />
      <circle cx={115 + lookX} cy={99} r={3.4} fill="#5b4bb0" />
      <circle cx={86.2 + lookX} cy={97.6} r={1.1} fill="#fff" />
      <circle cx={116.2 + lookX} cy={97.6} r={1.1} fill="#fff" />
    </g>
  );
}

function Brows({ state }: { state: SophieState }) {
  const stroke = { stroke: hairMid, strokeWidth: 2.4, strokeLinecap: 'round' as const, fill: 'none' };
  if (state === 'thinking') {
    return (
      <g {...stroke}>
        <path d="M78 84 q7 -2 14 -1" />
        <path d="M108 80 q7 -3 14 0" />
      </g>
    );
  }
  if (state === 'encouraging') {
    return (
      <g {...stroke}>
        <path d="M78 84 q7 2 14 1" />
        <path d="M108 85 q7 1 14 -1" />
      </g>
    );
  }
  return (
    <g {...stroke}>
      <path d="M78 83 q7 -2 14 0" />
      <path d="M108 83 q7 -2 14 0" />
    </g>
  );
}

function Mouth({ state }: { state: SophieState }) {
  if (state === 'proud') return <path d="M88 116 q12 12 24 0" stroke="#b85c5c" strokeWidth={2.6} fill="#e88" fillOpacity={0.5} strokeLinecap="round" />;
  if (state === 'happy') return <path d="M90 115 q10 9 20 0" stroke="#b85c5c" strokeWidth={2.6} fill="none" strokeLinecap="round" />;
  if (state === 'hint') return <ellipse cx={100} cy={116} rx={5} ry={4} fill="#b85c5c" fillOpacity={0.55} />;
  // idle / thinking / encouraging — мягкая улыбка.
  return <path d="M92 115 q8 5 16 0" stroke="#b85c5c" strokeWidth={2.4} fill="none" strokeLinecap="round" />;
}

export function SophiePortrait({ state = 'idle', size = 132 }: { state?: SophieState; size?: number }) {
  const reduced = useAppStore((s) => s.reducedMotion);
  const cheeks = state === 'happy' || state === 'proud';
  const breathe = reduced
    ? {}
    : { animate: { scale: [1, 1.015, 1] }, transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const } };
  const lampPulse = reduced
    ? {}
    : { animate: { opacity: [0.55, 1, 0.55] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`Софи — наставница (${state})`}>
      <defs>
        <radialGradient id="sophie-vignette" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="rgba(139,123,255,0.28)" />
          <stop offset="100%" stopColor="rgba(139,123,255,0)" />
        </radialGradient>
        <radialGradient id="sophie-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,206,106,0.95)" />
          <stop offset="100%" stopColor="rgba(255,206,106,0)" />
        </radialGradient>
        <linearGradient id="sophie-mantle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a6ed6" />
          <stop offset="100%" stopColor="#5b4fae" />
        </linearGradient>
        <linearGradient id="sophie-hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="55%" stopColor={hairMid} />
          <stop offset="100%" stopColor={hairDeep} />
        </linearGradient>
      </defs>

      <circle cx={100} cy={92} r={92} fill="url(#sophie-vignette)" />

      {/* Лампа-огонёк сбоку */}
      <motion.g {...lampPulse}>
        <circle cx={171} cy={120} r={26} fill="url(#sophie-lamp)" />
        <circle cx={171} cy={120} r={6} fill="#ffe2a6" />
        <circle cx={171} cy={120} r={3} fill="#fff6e0" />
      </motion.g>

      <motion.g {...breathe} style={{ transformOrigin: '100px 130px' }}>
        {/* Мантия и воротник */}
        <path d="M44 200 C50 158 70 142 100 142 C130 142 150 158 156 200 Z" fill="url(#sophie-mantle)" />
        <path d="M82 150 C90 168 110 168 118 150 L112 142 L88 142 Z" fill="#f3e9d6" />
        <path d="M44 200 C50 168 64 152 78 146" fill="none" stroke="#f3e9d6" strokeWidth={2} strokeOpacity={0.5} />
        <path d="M156 200 C150 168 136 152 122 146" fill="none" stroke="#f3e9d6" strokeWidth={2} strokeOpacity={0.5} />

        {/* Коса через плечо */}
        <g fill={hairMid} stroke={hairDeep} strokeWidth={0.6}>
          <ellipse cx={70} cy={150} rx={9} ry={8} />
          <ellipse cx={66} cy={163} rx={8} ry={7.5} />
          <ellipse cx={63} cy={175} rx={7} ry={6.5} />
          <ellipse cx={61} cy={185} rx={5.5} ry={5} />
        </g>
        <path d="M59 190 l-3 7 m6 -7 l1 7" stroke={hairDeep} strokeWidth={1.4} strokeLinecap="round" />

        {/* Шея */}
        <path d="M88 128 h24 v12 c0 6 -24 6 -24 0 Z" fill={skinShade} />

        {/* Уши эльфа */}
        <path d="M64 92 L52 78 L66 86 Z" fill={skin} stroke={skinShade} strokeWidth={1} />
        <path d="M136 92 L148 78 L134 86 Z" fill={skin} stroke={skinShade} strokeWidth={1} />

        {/* Волосы (затылок) */}
        <path d="M58 96 C56 58 78 40 100 40 C122 40 144 58 142 96 C150 78 146 60 132 50 C150 64 150 92 142 104 L138 78 C140 96 132 104 132 104 L130 70 C126 92 120 96 120 96 L118 64 C112 88 100 90 100 90 C100 90 88 88 82 64 L80 96 C80 96 74 92 70 70 L68 104 C68 104 60 96 62 78 L58 104 C50 92 50 64 68 50 C54 60 50 78 58 96 Z" fill="url(#sophie-hair)" />

        {/* Лицо */}
        <ellipse cx={100} cy={96} rx={38} ry={42} fill={skin} />
        {cheeks && (
          <g fill="#ff9d7a" fillOpacity={0.4}>
            <ellipse cx={78} cy={110} rx={7} ry={4.5} />
            <ellipse cx={122} cy={110} rx={7} ry={4.5} />
          </g>
        )}

        {/* Чёлка */}
        <path d="M62 84 C66 56 84 44 100 44 C116 44 134 56 138 84 C132 70 120 62 120 62 C118 74 112 78 112 78 C110 66 100 62 100 62 C100 62 90 66 88 78 C88 78 82 74 80 62 C80 62 68 70 62 84 Z" fill="url(#sophie-hair)" />

        <Brows state={state} />
        <Eyes state={state} />
        <Mouth state={state} />

        {/* Серёжка-самоцвет */}
        <circle cx={136} cy={108} r={2.6} fill="#8b7bff" />
      </motion.g>

      {/* Искры на успех */}
      {(state === 'happy' || state === 'proud') && !reduced && (
        <motion.g
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.8], y: [0, -8, -14] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.4 }}
          fill="#ffce6a"
        >
          <path d="M150 56 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
          <path d="M44 70 l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5 Z" fill="#ff9d5c" />
        </motion.g>
      )}
    </svg>
  );
}
