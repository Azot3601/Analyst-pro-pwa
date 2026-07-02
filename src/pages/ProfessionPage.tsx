import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Brain,
  Compass,
  GitBranch,
  Layers,
  MessagesSquare,
  Scale,
  Target,
  Users
} from 'lucide-react';
import type { ReactNode } from 'react';
import { knowledgeDiagrams } from '../features/knowledge/diagrams';
import { GlossaryText } from '../features/knowledge/GlossaryText';

function Section({
  id,
  icon,
  title,
  children
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 flex items-center gap-2.5 font-display text-2xl font-bold text-white">
        <span className="grid size-9 place-items-center rounded-xl bg-electric/15 text-electric">{icon}</span>
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-7 text-slate-300">{children}</div>
    </section>
  );
}

function P({ children }: { children: string }) {
  return (
    <p>
      <GlossaryText>{children}</GlossaryText>
    </p>
  );
}

function Diagram({ id }: { id: string }) {
  const diagram = knowledgeDiagrams[id];
  if (!diagram) return null;
  return (
    <figure className="my-4 rounded-2xl border border-white/[0.08] bg-ink/40 p-4">
      <diagram.Component />
      <figcaption className="mt-2 text-center text-xs text-slate-500">{diagram.title}</figcaption>
    </figure>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-white/[0.06] text-slate-200">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-white/10 px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-white/[0.02]">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-white/5 px-3 py-2 align-top text-slate-300">
                  <GlossaryText>{cell}</GlossaryText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const toc = [
  { id: 'kto', label: 'Кто это' },
  { id: 'chem', label: 'Чем занимается' },
  { id: 'etapy', label: 'Этапы работы' },
  { id: 'ludi', label: 'Стейкхолдеры' },
  { id: 'trebovaniya', label: 'Требования' },
  { id: 'proverki', label: 'Валидация и верификация' },
  { id: 'myshlenie', label: 'Мышление и навыки' },
  { id: 'oshibki', label: 'Частые ошибки' }
];

export function ProfessionPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0">
        <div className="mx-auto max-w-[72ch] space-y-10">
          <header>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-electric/80">
              Профессия · с чего начать
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Кто такой системный аналитик и как он мыслит
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Большая обзорная статья: что делает системный аналитик, из каких этапов состоит его работа, с кем он
              взаимодействует и какой способ мышления делает его сильным. Незнакомые термины подсвечены — наведи, чтобы
              увидеть краткую сводку, или нажми, чтобы открыть в базе знаний.
            </p>
          </header>

          <Section id="kto" icon={<Compass size={18} />} title="Кто это">
            <P>
              Системный аналитик — это мост между бизнесом и разработкой. Бизнес говорит на языке целей и денег,
              разработка — на языке систем и данных. Аналитик переводит одно в другое так, чтобы обе стороны понимали
              одно и то же. Он превращает размытую потребность («хотим меньше возвратов») в проверяемые требования,
              модели и контракт API, по которым команда может построить систему без догадок.
            </P>
            <P>
              Ключевое: аналитик не «пишет ТЗ по диктовку». Он выясняет, что на самом деле нужно, находит противоречия,
              отделяет факты от домыслов и проектирует решение, которое решает реальную проблему, а не формально
              закрывает заявку.
            </P>
          </Section>

          <Section id="chem" icon={<Layers size={18} />} title="Чем занимается">
            <P>
              Работа аналитика — это поток артефактов, каждый из которых снижает неопределённость. Из разговора рождается
              список требований; из требований — модели процессов и данных; из моделей — контракт API и критерии приёмки.
              Каждый шаг делает будущую систему чуть более определённой и проверяемой.
            </P>
            <Table
              head={['Что делает', 'Результат (артефакт)']}
              rows={[
                ['Выясняет потребности (элиситация)', 'список требований, вопросы, зафиксированные допущения'],
                ['Анализирует и моделирует', 'BPMN-процессы, ERD, use-case, диаграммы'],
                ['Специфицирует', 'user story, критерии приёмки, НФТ'],
                ['Проектирует обмен', 'контракт API, модель ошибки, сценарии интеграции'],
                ['Проверяет и сопровождает', 'валидация и верификация, прослеживаемость, поддержка команды']
              ]}
            />
          </Section>

          <Section id="etapy" icon={<GitBranch size={18} />} title="Этапы работы — «петля аналитика»">
            <P>
              Работа идёт не по прямой, а по петле: выяснили → смоделировали → описали → проверили → уточнили. На каждом
              витке требования становятся точнее. Ниже — этапы и что происходит на каждом.
            </P>
            <Table
              head={['Этап', 'Что происходит', 'Главный риск']}
              rows={[
                ['Элиситация', 'выявляем потребности у стейкхолдеров, задаём вопросы', 'пропустить стейкхолдера или принять допущение за факт'],
                ['Анализ', 'структурируем, ищем противоречия, приоритизируем', 'оставить неоднозначность неразрешённой'],
                ['Моделирование', 'рисуем процессы (BPMN), данные (ERD), сценарии (use-case)', 'модель ради модели, а не ради ясности'],
                ['Спецификация', 'пишем требования и критерии приёмки', 'непроверяемое требование'],
                ['Проверка', 'валидация и верификация требований', 'проверить форму, но не нужность'],
                ['Сопровождение', 'поддерживаем команду, ведём прослеживаемость', 'требования расходятся с реализацией']
              ]}
            />
            <Diagram id="bpmn" />
          </Section>

          <Section id="ludi" icon={<Users size={18} />} title="С кем взаимодействует — стейкхолдеры">
            <P>
              Аналитик работает не с «заказчиком», а с целым набором сторон — стейкхолдеров. У каждого свои цели, и
              забытый стейкхолдер — это требование, которое всплывёт в самом конце и всё перевернёт. Поэтому первым делом
              аналитик составляет карту: кто пользуется, кто платит, кто ограничивает.
            </P>
            <Table
              head={['Стейкхолдер', 'Что ему важно', 'Риск, если забыть']}
              rows={[
                ['Бизнес / заказчик', 'цель, ценность, сроки', 'построим не то, что двигает бизнес'],
                ['Пользователи', 'простота, польза', 'система «правильная», но неудобная'],
                ['Разработка', 'однозначный контракт', 'догадки и переделки'],
                ['Поддержка', 'меньше обращений, понятные ошибки', 'вал обращений после релиза'],
                ['Безопасность', 'аутентификация, авторизация, контроль', 'дыры и инциденты'],
                ['Смежные системы', 'стабильный контракт, совместимость', 'ломающие изменения у интеграторов']
              ]}
            />
            <P>
              Часто интересы сторон противоречат друг другу — возникает конфликт интересов. Аналитик здесь нейтральная
              сторона: делает противоречие явным и помогает прийти к решению по критериям, а не «кто громче».
            </P>
          </Section>

          <Section id="trebovaniya" icon={<Target size={18} />} title="Требования: от потребности к проверяемому">
            <P>
              Требования спускаются по уровням: бизнес-требования (зачем) → пользовательские (кто и что хочет) →
              функциональные (что делает система) и нефункциональные требования (как хорошо). Сильное требование
              однозначно, проверяемо и привязано к ценности; слабое — оценочное («быстро», «удобно») и потому
              непроверяемо.
            </P>
            <Diagram id="requirements-levels" />
            <P>
              Хорошая практика — формулировать нужное как пользовательскую историю с критериями приёмки и обязательно
              думать о scope: что входит, а что сознательно оставляем за рамками, чтобы избежать расползания (scope
              creep). Приоритизация (например, MoSCoW) помогает решить, что делать сначала.
            </P>
            <Diagram id="user-story" />
          </Section>

          <Section id="proverki" icon={<Scale size={18} />} title="Валидация и верификация — не путать">
            <P>
              Две проверки, которые постоянно путают. Верификация спрашивает «делаем ли вещь правильно» — по
              спецификации. Валидация спрашивает «ту ли вещь мы делаем» — нужна ли она вообще. Можно идеально по спеке
              построить ненужное — это пройдёт верификацию, но провалит валидацию.
            </P>
            <Table
              head={['', 'Валидация', 'Верификация']}
              rows={[
                ['Вопрос', '«ту ли вещь делаем?»', '«правильно ли делаем?»'],
                ['Смотрит', 'наружу — к потребности и ценности', 'внутрь — к спецификации и правилам'],
                ['Для требований', 'отражают ли реальные нужды стейкхолдеров', 'корректны, полны, непротиворечивы, проверяемы'],
                ['Пример', 'демо стейкхолдеру, прототип', 'ревью спецификации, сверка с контрактом API']
              ]}
            />
            <P>
              Именно поэтому различают валидацию требований и верификацию требований: первая проверяет, что мы описали
              правильные требования, вторая — что мы описали их правильно. Обе нужны, и обе — работа аналитика.
            </P>
          </Section>

          <Section id="myshlenie" icon={<Brain size={18} />} title="Способ мышления и ключевые навыки">
            <P>
              Сила аналитика не в инструментах, а в способе мышления. Он подходит к задаче не с решения, а с вопроса
              «какую проблему мы вообще решаем и для кого». Он не верит формулировкам на слово: отделяет факт от
              допущения и проверяет критичные допущения до того, как они станут дорогой ошибкой.
            </P>
            <P>
              Он задаёт правильные вопросы — не «какую кнопку сделать», а «что должно произойти и как мы поймём, что
              получилось». Он ориентируется на ценность и проверяемость: каждое требование должно быть привязано к цели
              (прослеживаемость) и иметь критерий приёмки. В сложных кейсах он принимает решения не по интуиции, а по
              явным критериям — через матрицу компромиссов (trade-off) и фиксирует их в ADR, чтобы к спору не
              возвращаться.
            </P>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Отделяй факт от домысла', 'Ищи слова «наверное», «обычно» — за ними прячется непроверенное допущение.'],
                ['Начинай с «зачем»', 'Пойми бизнес-цель и стейкхолдеров прежде, чем описывать экраны.'],
                ['Делай проверяемым', 'Нет критерия приёмки — нет требования, а есть пожелание.'],
                ['Улаживай конфликты по критериям', 'Не «кто настойчивее», а сравнение по ценности и риску.'],
                ['Фиксируй границы', 'Явный scope и приоритизация спасают сроки от расползания.'],
                ['Решай осознанно', 'Trade-off и ADR вместо «решили так, не помню почему».']
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="text-sm font-semibold text-slate-100">{t}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    <GlossaryText>{d}</GlossaryText>
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="oshibki" icon={<AlertTriangle size={18} />} title="Частые ошибки аналитика">
            <ul className="space-y-2">
              {[
                'Принять допущение за факт и не проверить его.',
                'Собрать требования только у заказчика, забыв поддержку, безопасность, смежные системы.',
                'Оставить оценочные формулировки («быстро», «удобно») без измеримого критерия.',
                'Проверить форму требований (верификация), но не их нужность (валидация).',
                'Не зафиксировать scope — и получить расползание в процессе.',
                'Принять решение в сложном кейсе по интуиции и не записать, почему.'
              ].map((item) => (
                <li key={item} className="flex gap-2 text-[15px] leading-7 text-slate-300">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-danger" />
                  <GlossaryText>{item}</GlossaryText>
                </li>
              ))}
            </ul>
          </Section>

          <div className="rounded-2xl border border-electric/20 bg-electric/[0.06] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-electric">
              <MessagesSquare size={16} /> Дальше
            </div>
            <p className="mt-1.5 text-sm leading-6 text-slate-200">
              Разобрался с ролью — переходи к практике. Каждый термин из этой статьи подробно разобран в{' '}
              <Link to="/knowledge" className="font-semibold text-electric underline decoration-dotted">
                базе знаний
              </Link>
              , а навыки закрепляются в{' '}
              <Link to="/trainer" className="font-semibold text-electric underline decoration-dotted">
                тренажёре
              </Link>
              .
            </p>
          </div>
        </div>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-20">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">В этой статье</div>
          <nav className="space-y-1 border-l border-white/10">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-slate-400 transition hover:border-electric hover:text-electric"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
