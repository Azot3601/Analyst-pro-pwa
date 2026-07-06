import { Lightbulb, Volume2 } from 'lucide-react';
import type { InsightCard as InsightCardData } from '../../data/insightCards';

// Карточка-контраст между путаемыми понятиями. Озвучка — опциональная кнопка
// через Web Speech API (без внешних сервисов), не автовоспроизведение.

const speak = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ru-RU';
  window.speechSynthesis.speak(utter);
};

export function InsightCard({ card, onReviewed }: { card: InsightCardData; onReviewed?: () => void }) {
  return (
    <div className="rounded-xl border border-mentor/25 bg-mentor/[0.05] p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <Lightbulb size={14} className="shrink-0 text-mentor" />
        <span className="text-sm font-semibold text-slate-100">{card.title}</span>
        {'speechSynthesis' in globalThis && (
          <button
            onClick={() => speak(`${card.title}. ${card.contrast}`)}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-white/[0.12]"
            title="Озвучить"
          >
            <Volume2 size={11} /> озвучить
          </button>
        )}
      </div>
      <div className="mb-2 flex justify-center" dangerouslySetInnerHTML={{ __html: card.svg }} />
      <p className="text-xs leading-5 text-slate-300">{card.contrast}</p>
      {onReviewed && (
        <button onClick={onReviewed} className="mt-2 text-[11px] font-semibold text-electric hover:underline">
          Понятно — отправить в повторение
        </button>
      )}
    </div>
  );
}
