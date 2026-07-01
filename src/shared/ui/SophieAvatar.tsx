import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from '../../app/store';
import { SophiePortrait, type SophieState } from './SophiePortrait';

// Портрет-медальон Софи на основе сгенерированной иллюстрации (public/sophie.png).
// Светлый фон картинки обыгран как «портрет в золотой раме» — в тему Архива.
// Если файл не положен — аккуратно откатываемся на SVG-портрет.

const auraByState: Record<SophieState, string> = {
  idle: 'rgba(139,123,255,0.40)',
  thinking: 'rgba(139,123,255,0.40)',
  hint: 'rgba(255,206,106,0.45)',
  happy: 'rgba(87,217,163,0.50)',
  proud: 'rgba(255,206,106,0.55)',
  encouraging: 'rgba(255,122,147,0.45)'
};

export function SophieAvatar({ state = 'idle', size = 96 }: { state?: SophieState; size?: number }) {
  const reduced = useAppStore((s) => s.reducedMotion);
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className="grid place-items-center rounded-full border-2 border-amber/40 bg-ink/60 shadow-lift"
        style={{ width: size, height: size }}
      >
        <SophiePortrait state={state} size={size - 6} />
      </div>
    );
  }

  const float = reduced
    ? {}
    : { animate: { y: [0, -4, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${auraByState[state]}, transparent 70%)` }}
      />
      <motion.div
        {...float}
        className="relative z-10 overflow-hidden rounded-full border-2 border-amber/40 shadow-lift"
        style={{ width: size, height: size }}
      >
        <img
          src="/sophie.png"
          alt="Софи, Чтица свитков"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 20%' }}
        />
      </motion.div>
      {(state === 'happy' || state === 'proud') && !reduced && (
        <motion.span
          className="absolute right-1 top-0 z-20 text-amber"
          initial={{ opacity: 0, scale: 0.6, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.8], y: [0, -8, -14] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.4 }}
        >
          ✦
        </motion.span>
      )}
    </div>
  );
}
