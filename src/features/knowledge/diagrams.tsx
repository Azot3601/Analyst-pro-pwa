/* eslint-disable react-refresh/only-export-components -- diagram registry module, not a hot-reloaded component file */
import type { ReactElement, ReactNode } from 'react';

// Инлайн-SVG диаграммы для базы знаний: офлайн, масштабируемые, под тёмную тему.
// Реестр по diagramId — узел знания ссылается на диаграмму через поле diagramId.

const C = {
  electric: '#8b7bff',
  mentor: '#b3a4ff',
  amber: '#ffce6a',
  success: '#57d9a3',
  danger: '#ff7a93',
  line: '#3a3358',
  surface: '#221d34',
  surface2: '#1a1728',
  text: '#e7e3f7',
  sub: '#a99fc7'
};

type SvgProps = { className?: string };

function Frame({ children, viewBox, label, className }: { children: ReactNode; viewBox: string; label: string; className?: string }) {
  return (
    <svg
      viewBox={viewBox}
      width="100%"
      role="img"
      aria-label={label}
      className={className}
      style={{ display: 'block', height: 'auto', fontFamily: 'inherit' }}
    >
      <defs>
        <marker id="kd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.sub} />
        </marker>
        <marker id="kd-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.electric} />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

const box = (x: number, y: number, w: number, h: number, stroke: string, fill = C.surface) => (
  <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={1.5} />
);

function RequestResponse({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 220" label="HTTP request и response между клиентом и сервером">
      {box(24, 70, 150, 80, C.line)}
      <text x={99} y={104} textAnchor="middle" fill={C.text} fontSize={15} fontWeight={700}>Клиент</text>
      <text x={99} y={126} textAnchor="middle" fill={C.sub} fontSize={11}>фронт / интеграция</text>

      {box(466, 70, 150, 80, C.line)}
      <text x={541} y={104} textAnchor="middle" fill={C.text} fontSize={15} fontWeight={700}>Сервер</text>
      <text x={541} y={126} textAnchor="middle" fill={C.sub} fontSize={11}>API-сервис</text>

      <line x1={178} y1={96} x2={462} y2={96} stroke={C.electric} strokeWidth={2} markerEnd="url(#kd-arrow-accent)" />
      <text x={320} y={86} textAnchor="middle" fill={C.electric} fontSize={12} fontWeight={600}>request</text>
      <text x={320} y={113} textAnchor="middle" fill={C.sub} fontSize={11}>method · path · headers · body</text>

      <line x1={462} y1={134} x2={178} y2={134} stroke={C.success} strokeWidth={2} markerEnd="url(#kd-arrow)" />
      <text x={320} y={156} textAnchor="middle" fill={C.success} fontSize={12} fontWeight={600}>response</text>
      <text x={320} y={173} textAnchor="middle" fill={C.sub} fontSize={11}>status code · body</text>

      <text x={24} y={36} fill={C.text} fontSize={13} fontWeight={700}>Один обмен = запрос + ответ</text>
    </Frame>
  );
}

function StatusMap({ className }: SvgProps): ReactElement {
  const col = (x: number, color: string, code: string, title: string, items: string[]) => (
    <g>
      {box(x, 56, 178, 132, color, C.surface2)}
      <rect x={x} y={56} width={178} height={30} rx={12} fill={color} fillOpacity={0.16} />
      <text x={x + 16} y={77} fill={color} fontSize={15} fontWeight={800}>{code}</text>
      <text x={x + 60} y={77} fill={C.text} fontSize={12} fontWeight={600}>{title}</text>
      {items.map((it, i) => (
        <text key={it} x={x + 16} y={110 + i * 22} fill={C.sub} fontSize={12}>• {it}</text>
      ))}
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 210" label="Карта групп HTTP статус-кодов">
      <text x={24} y={36} fill={C.text} fontSize={13} fontWeight={700}>Статус-код = первая цифра решает всё</text>
      {col(24, C.success, '2xx', 'успех', ['200 OK', '201 Created', '204 No Content'])}
      {col(232, C.danger, '4xx', 'ошибка клиента', ['400 Bad Request', '404 Not Found', '409 Conflict'])}
      {col(440, C.amber, '5xx', 'ошибка сервера', ['500 Internal', '503 Unavailable', '504 Timeout'])}
    </Frame>
  );
}

function EndpointAnatomy({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 200" label="Анатомия URL эндпоинта">
      <text x={24} y={34} fill={C.text} fontSize={13} fontWeight={700}>Из чего состоит адрес ресурса</text>
      <rect x={24} y={64} width={592} height={46} rx={12} fill={C.surface2} stroke={C.line} strokeWidth={1.5} />
      <text x={40} y={93} fontSize={15} fontFamily="monospace">
        <tspan fill={C.sub}>/api/v1</tspan>
        <tspan fill={C.electric} fontWeight={700}>/orders</tspan>
        <tspan fill={C.amber} fontWeight={700}>/{'{orderId}'}</tspan>
        <tspan fill={C.mentor} fontWeight={700}>?status=paid</tspan>
      </text>

      <line x1={70} y1={120} x2={70} y2={140} stroke={C.sub} strokeWidth={1.2} />
      <text x={70} y={156} textAnchor="middle" fill={C.sub} fontSize={11}>база</text>

      <line x1={150} y1={120} x2={150} y2={140} stroke={C.electric} strokeWidth={1.2} />
      <text x={150} y={156} textAnchor="middle" fill={C.electric} fontSize={11}>ресурс</text>

      <line x1={250} y1={120} x2={250} y2={140} stroke={C.amber} strokeWidth={1.2} />
      <text x={250} y={156} textAnchor="middle" fill={C.amber} fontSize={11}>path-параметр</text>
      <text x={250} y={172} textAnchor="middle" fill={C.sub} fontSize={10}>конкретный ресурс</text>

      <line x1={400} y1={120} x2={400} y2={140} stroke={C.mentor} strokeWidth={1.2} />
      <text x={400} y={156} textAnchor="middle" fill={C.mentor} fontSize={11}>query-параметр</text>
      <text x={400} y={172} textAnchor="middle" fill={C.sub} fontSize={10}>фильтр / опции</text>
    </Frame>
  );
}

function JsonSchemaGate({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 220" label="JSON Schema как контроль на входе">
      <text x={24} y={34} fill={C.text} fontSize={13} fontWeight={700}>Schema — это «турникет» на входе данных</text>

      {box(24, 70, 150, 86, C.line, C.surface2)}
      <text x={99} y={100} textAnchor="middle" fill={C.text} fontSize={13} fontWeight={700}>JSON</text>
      <text x={99} y={120} textAnchor="middle" fill={C.sub} fontSize={11}>payload</text>
      <text x={99} y={138} textAnchor="middle" fill={C.sub} fontSize={11}>от потребителя</text>

      <line x1={178} y1={113} x2={250} y2={113} stroke={C.sub} strokeWidth={2} markerEnd="url(#kd-arrow)" />

      <polygon points="262,73 386,73 410,113 386,153 262,153 286,113" fill={C.electric} fillOpacity={0.14} stroke={C.electric} strokeWidth={1.5} />
      <text x={336} y={108} textAnchor="middle" fill={C.text} fontSize={13} fontWeight={700}>JSON Schema</text>
      <text x={336} y={126} textAnchor="middle" fill={C.sub} fontSize={11}>required · type · enum</text>

      <line x1={410} y1={96} x2={486} y2={96} stroke={C.success} strokeWidth={2} markerEnd="url(#kd-arrow)" />
      {box(486, 70, 130, 48, C.success, C.surface2)}
      <text x={551} y={99} textAnchor="middle" fill={C.success} fontSize={13} fontWeight={700}>valid →</text>

      <line x1={410} y1={132} x2={486} y2={132} stroke={C.danger} strokeWidth={2} markerEnd="url(#kd-arrow)" />
      {box(486, 110, 130, 48, C.danger, C.surface2)}
      <text x={551} y={139} textAnchor="middle" fill={C.danger} fontSize={13} fontWeight={700}>422 ошибка</text>
    </Frame>
  );
}

function Idempotency({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 220" label="Идемпотентность через ключ">
      <text x={24} y={34} fill={C.text} fontSize={13} fontWeight={700}>Повтор с тем же ключом → один результат</text>

      {box(24, 64, 196, 44, C.electric, C.surface2)}
      <text x={40} y={91} fill={C.text} fontSize={12} fontFamily="monospace">POST /payments · key=ab12</text>
      {box(24, 120, 196, 44, C.line, C.surface2)}
      <text x={40} y={147} fill={C.sub} fontSize={12} fontFamily="monospace">POST /payments · key=ab12</text>
      <text x={24} y={185} fill={C.sub} fontSize={11}>обрыв сети → клиент повторил</text>

      <line x1={220} y1={86} x2={392} y2={104} stroke={C.electric} strokeWidth={2} markerEnd="url(#kd-arrow-accent)" />
      <line x1={220} y1={142} x2={392} y2={120} stroke={C.sub} strokeWidth={2} strokeDasharray="5 4" markerEnd="url(#kd-arrow)" />

      {box(392, 84, 130, 56, C.line)}
      <text x={457} y={108} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={700}>Сервер</text>
      <text x={457} y={126} textAnchor="middle" fill={C.sub} fontSize={10}>помнит ключ</text>

      <line x1={522} y1={112} x2={580} y2={112} stroke={C.success} strokeWidth={2} markerEnd="url(#kd-arrow)" />
      <circle cx={604} cy={112} r={20} fill={C.success} fillOpacity={0.16} stroke={C.success} strokeWidth={1.5} />
      <text x={604} y={117} textAnchor="middle" fill={C.success} fontSize={12} fontWeight={800}>1</text>
      <text x={604} y={150} textAnchor="middle" fill={C.sub} fontSize={10}>платёж</text>
    </Frame>
  );
}

function HttpMethodsCrud({ className }: SvgProps): ReactElement {
  const row = (y: number, method: string, color: string, crud: string, note: string) => (
    <g>
      <rect x={24} y={y} width={120} height={34} rx={9} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.3} />
      <text x={84} y={y + 22} textAnchor="middle" fill={color} fontSize={13} fontWeight={800} fontFamily="monospace">{method}</text>
      <line x1={150} y1={y + 17} x2={196} y2={y + 17} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <text x={206} y={y + 22} fill={C.text} fontSize={13} fontWeight={700}>{crud}</text>
      <text x={330} y={y + 22} fill={C.sub} fontSize={12}>{note}</text>
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 246" label="Соответствие HTTP-методов и CRUD">
      <text x={24} y={30} fill={C.text} fontSize={13} fontWeight={700}>HTTP-метод = намерение операции</text>
      {row(48, 'GET', C.success, 'Read', 'прочитать ресурс, без изменений')}
      {row(92, 'POST', C.electric, 'Create', 'создать новый ресурс')}
      {row(136, 'PUT/PATCH', C.amber, 'Update', 'заменить / частично изменить')}
      {row(180, 'DELETE', C.danger, 'Delete', 'удалить ресурс')}
    </Frame>
  );
}

function SqlJoin({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 250" label="JOIN соединяет таблицы по ключу">
      <text x={24} y={32} fill={C.text} fontSize={13} fontWeight={700}>JOIN соединяет таблицы по ключу, а не по похожим именам</text>
      <circle cx={262} cy={150} r={92} fill={C.electric} fillOpacity={0.16} stroke={C.electric} strokeWidth={1.5} />
      <circle cx={392} cy={150} r={92} fill={C.mentor} fillOpacity={0.16} stroke={C.mentor} strokeWidth={1.5} />
      <text x={205} y={120} textAnchor="middle" fill={C.electric} fontSize={13} fontWeight={700}>orders</text>
      <text x={450} y={120} textAnchor="middle" fill={C.mentor} fontSize={13} fontWeight={700}>customers</text>
      <text x={327} y={148} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={700}>INNER</text>
      <text x={327} y={164} textAnchor="middle" fill={C.sub} fontSize={10}>есть в обеих</text>
      <text x={200} y={196} textAnchor="middle" fill={C.sub} fontSize={10}>LEFT JOIN</text>
      <text x={200} y={210} textAnchor="middle" fill={C.sub} fontSize={10}>сохранит и сюда</text>
      <text x={24} y={240} fill={C.sub} fontSize={11}>INNER — только совпадения по ключу · LEFT — все orders + совпавшие customers</text>
    </Frame>
  );
}

function SqlGroupBy({ className }: SvgProps): ReactElement {
  const row = (y: number, status: string, color: string) => (
    <g>
      <rect x={24} y={y} width={150} height={26} rx={7} fill={C.surface2} stroke={C.line} strokeWidth={1} />
      <text x={36} y={y + 17} fill={C.sub} fontSize={11} fontFamily="monospace">order · {status}</text>
      <circle cx={163} cy={y + 13} r={4} fill={color} />
    </g>
  );
  const bucket = (y: number, status: string, color: string, agg: string) => (
    <g>
      <rect x={420} y={y} width={196} height={40} rx={10} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.3} />
      <text x={436} y={y + 18} fill={color} fontSize={12} fontWeight={700}>{status}</text>
      <text x={436} y={y + 33} fill={C.sub} fontSize={11} fontFamily="monospace">{agg}</text>
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 220" label="GROUP BY группирует строки и считает агрегаты">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>GROUP BY: строки → группы → показатели</text>
      {row(48, 'paid', C.success)}
      {row(80, 'paid', C.success)}
      {row(112, 'shipped', C.amber)}
      {row(144, 'paid', C.success)}
      <line x1={200} y1={110} x2={412} y2={96} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <line x1={200} y1={120} x2={412} y2={150} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <text x={300} y={96} textAnchor="middle" fill={C.electric} fontSize={11} fontWeight={600}>GROUP BY status</text>
      {bucket(78, 'paid', C.success, 'COUNT=3 · SUM=…')}
      {bucket(132, 'shipped', C.amber, 'COUNT=1 · SUM=…')}
    </Frame>
  );
}

function RequirementsLevels({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 240" label="Уровни требований">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>Требования спускаются с уровня на уровень</text>
      <polygon points="240,52 400,52 372,92 268,92" fill={C.electric} fillOpacity={0.16} stroke={C.electric} strokeWidth={1.3} />
      <text x={320} y={78} textAnchor="middle" fill={C.electric} fontSize={12} fontWeight={700}>Бизнес</text>
      <polygon points="268,98 372,98 410,142 230,142" fill={C.mentor} fillOpacity={0.16} stroke={C.mentor} strokeWidth={1.3} />
      <text x={320} y={126} textAnchor="middle" fill={C.mentor} fontSize={12} fontWeight={700}>Пользовательские</text>
      <polygon points="230,148 410,148 452,200 188,200" fill={C.success} fillOpacity={0.14} stroke={C.success} strokeWidth={1.3} />
      <text x={320} y={178} textAnchor="middle" fill={C.success} fontSize={12} fontWeight={700}>Функциональные</text>
      <rect x={470} y={148} width={150} height={52} rx={10} fill={C.amber} fillOpacity={0.12} stroke={C.amber} strokeWidth={1.3} />
      <text x={545} y={170} textAnchor="middle" fill={C.amber} fontSize={12} fontWeight={700}>НФТ</text>
      <text x={545} y={187} textAnchor="middle" fill={C.sub} fontSize={10}>качество системы</text>
      <text x={24} y={228} fill={C.sub} fontSize={11}>Зачем (бизнес) → кто и что хочет (польз.) → что делает система (функц.) + как хорошо (НФТ)</text>
    </Frame>
  );
}

function UserStory({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 230" label="Формула user story и критерии приёмки">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>User story = роль + действие + ценность</text>
      {box(24, 44, 380, 96, C.electric)}
      <text x={44} y={74} fontSize={14}>
        <tspan fill={C.sub}>Я как </tspan>
        <tspan fill={C.electric} fontWeight={700}>покупатель</tspan>
      </text>
      <text x={44} y={100} fontSize={14}>
        <tspan fill={C.sub}>хочу </tspan>
        <tspan fill={C.mentor} fontWeight={700}>оформить возврат</tspan>
      </text>
      <text x={44} y={126} fontSize={14}>
        <tspan fill={C.sub}>чтобы </tspan>
        <tspan fill={C.success} fontWeight={700}>вернуть деньги за брак</tspan>
      </text>
      <text x={430} y={62} fill={C.text} fontSize={12} fontWeight={700}>Критерии приёмки</text>
      {['заказ ≤ 14 дней', 'создаётся заявка', 'видно подтверждение'].map((t, i) => (
        <g key={t}>
          <rect x={430} y={76 + i * 30} width={16} height={16} rx={4} fill={C.success} fillOpacity={0.2} stroke={C.success} strokeWidth={1.2} />
          <path d={`M ${434} ${85 + i * 30} l 3 3 l 5 -6`} stroke={C.success} strokeWidth={1.6} fill="none" />
          <text x={456} y={89 + i * 30} fill={C.sub} fontSize={12}>{t}</text>
        </g>
      ))}
      <text x={24} y={170} fill={C.danger} fontSize={11}>Без критериев приёмки история непроверяема — «готово» каждый понимает по-своему.</text>
    </Frame>
  );
}

function UseCase({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 230" label="Use case: актор, система и сценарии">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>Use case: кто (актор) что делает с системой</text>
      <circle cx={70} cy={120} r={12} fill="none" stroke={C.electric} strokeWidth={1.6} />
      <line x1={70} y1={132} x2={70} y2={160} stroke={C.electric} strokeWidth={1.6} />
      <line x1={52} y1={144} x2={88} y2={144} stroke={C.electric} strokeWidth={1.6} />
      <line x1={70} y1={160} x2={56} y2={182} stroke={C.electric} strokeWidth={1.6} />
      <line x1={70} y1={160} x2={84} y2={182} stroke={C.electric} strokeWidth={1.6} />
      <text x={70} y={205} textAnchor="middle" fill={C.electric} fontSize={12} fontWeight={600}>Покупатель</text>
      <rect x={160} y={56} width={440} height={150} rx={14} fill="none" stroke={C.line} strokeWidth={1.5} />
      <text x={180} y={78} fill={C.sub} fontSize={12} fontWeight={600}>Система заказов</text>
      {['Оформить заказ', 'Оплатить', 'Оформить возврат'].map((t, i) => (
        <g key={t}>
          <ellipse cx={380} cy={108 + i * 40} rx={120} ry={20} fill={C.mentor} fillOpacity={0.12} stroke={C.mentor} strokeWidth={1.3} />
          <text x={380} y={112 + i * 40} textAnchor="middle" fill={C.text} fontSize={12}>{t}</text>
          <line x1={88} y1={132} x2={262} y2={108 + i * 40} stroke={C.sub} strokeWidth={1} strokeOpacity={0.6} />
        </g>
      ))}
    </Frame>
  );
}

function Erd({ className }: SvgProps): ReactElement {
  const entity = (x: number, title: string, fields: string[], color: string) => (
    <g>
      <rect x={x} y={70} width={170} height={120} rx={10} fill={C.surface2} stroke={color} strokeWidth={1.5} />
      <rect x={x} y={70} width={170} height={28} rx={10} fill={color} fillOpacity={0.16} />
      <text x={x + 14} y={89} fill={color} fontSize={13} fontWeight={700}>{title}</text>
      {fields.map((f, i) => (
        <text key={f} x={x + 14} y={118 + i * 22} fill={C.sub} fontSize={11} fontFamily="monospace">{f}</text>
      ))}
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 230" label="ERD: сущности и связи">
      <text x={24} y={32} fill={C.text} fontSize={13} fontWeight={700}>ERD: сущности, поля и связи между ними</text>
      {entity(60, 'Клиент', ['PK id', 'name', 'email'], C.electric)}
      {entity(410, 'Заказ', ['PK id', 'FK client_id', 'total'], C.mentor)}
      <line x1={230} y1={130} x2={410} y2={130} stroke={C.success} strokeWidth={1.6} />
      <text x={250} y={122} fill={C.success} fontSize={11}>1</text>
      <path d="M 396 130 l -14 -8 M 396 130 l -14 8 M 396 130 l -14 0" stroke={C.success} strokeWidth={1.4} fill="none" />
      <text x={372} y={122} fill={C.success} fontSize={11}>N</text>
      <text x={320} y={150} textAnchor="middle" fill={C.sub} fontSize={11}>один клиент — много заказов</text>
    </Frame>
  );
}

function Bpmn({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 200" label="BPMN: процесс с развилкой">
      <text x={24} y={30} fill={C.text} fontSize={13} fontWeight={700}>BPMN: события, задачи и развилки процесса</text>
      <circle cx={56} cy={110} r={18} fill="none" stroke={C.success} strokeWidth={2} />
      <line x1={74} y1={110} x2={110} y2={110} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <rect x={110} y={92} width={110} height={36} rx={8} fill={C.surface2} stroke={C.electric} strokeWidth={1.4} />
      <text x={165} y={114} textAnchor="middle" fill={C.text} fontSize={11}>Проверить заказ</text>
      <line x1={220} y1={110} x2={256} y2={110} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <polygon points="282,110 300,92 318,110 300,128" fill={C.amber} fillOpacity={0.16} stroke={C.amber} strokeWidth={1.4} />
      <text x={300} y={114} textAnchor="middle" fill={C.amber} fontSize={12} fontWeight={700}>?</text>
      <line x1={318} y1={100} x2={360} y2={70} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <line x1={318} y1={120} x2={360} y2={150} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <rect x={360} y={52} width={120} height={34} rx={8} fill={C.surface2} stroke={C.success} strokeWidth={1.4} />
      <text x={420} y={73} textAnchor="middle" fill={C.text} fontSize={11}>Принять</text>
      <rect x={360} y={134} width={120} height={34} rx={8} fill={C.surface2} stroke={C.danger} strokeWidth={1.4} />
      <text x={420} y={155} textAnchor="middle" fill={C.text} fontSize={11}>Отклонить</text>
      <circle cx={534} cy={110} r={18} fill="none" stroke={C.danger} strokeWidth={3} />
      <line x1={480} y1={69} x2={516} y2={104} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <line x1={480} y1={151} x2={516} y2={116} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
    </Frame>
  );
}

function UmlSequence({ className }: SvgProps): ReactElement {
  const lifeline = (x: number, label: string, color: string) => (
    <g>
      <rect x={x - 60} y={48} width={120} height={32} rx={8} fill={C.surface2} stroke={color} strokeWidth={1.4} />
      <text x={x} y={69} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={600}>{label}</text>
      <line x1={x} y1={80} x2={x} y2={196} stroke={C.line} strokeWidth={1.2} strokeDasharray="4 4" />
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 220" label="UML sequence: обмен сообщениями">
      <text x={24} y={30} fill={C.text} fontSize={13} fontWeight={700}>UML sequence: порядок сообщений во времени</text>
      {lifeline(150, 'Клиент', C.electric)}
      {lifeline(470, 'Сервис', C.mentor)}
      <line x1={150} y1={108} x2={470} y2={108} stroke={C.electric} strokeWidth={1.6} markerEnd="url(#kd-arrow-accent)" />
      <text x={310} y={100} textAnchor="middle" fill={C.sub} fontSize={11}>POST /orders</text>
      <rect x={464} y={108} width={12} height={56} fill={C.mentor} fillOpacity={0.3} />
      <line x1={470} y1={164} x2={150} y2={164} stroke={C.success} strokeWidth={1.6} strokeDasharray="5 4" markerEnd="url(#kd-arrow)" />
      <text x={310} y={158} textAnchor="middle" fill={C.sub} fontSize={11}>201 Created</text>
    </Frame>
  );
}

function SyncAsync({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 240" label="Синхронное и асинхронное взаимодействие">
      <text x={24} y={26} fill={C.electric} fontSize={12} fontWeight={700}>Синхронно — клиент ждёт ответа</text>
      {box(24, 38, 120, 40, C.line)}
      <text x={84} y={62} textAnchor="middle" fill={C.text} fontSize={12}>Клиент</text>
      <line x1={144} y1={50} x2={440} y2={50} stroke={C.electric} strokeWidth={1.6} markerEnd="url(#kd-arrow-accent)" />
      <text x={290} y={42} textAnchor="middle" fill={C.sub} fontSize={10}>запрос · блокируется ⏳</text>
      <line x1={440} y1={66} x2={144} y2={66} stroke={C.success} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      {box(440, 38, 120, 40, C.line)}
      <text x={500} y={62} textAnchor="middle" fill={C.text} fontSize={12}>Сервис</text>

      <text x={24} y={132} fill={C.mentor} fontSize={12} fontWeight={700}>Асинхронно — кладём в очередь и не ждём</text>
      {box(24, 144, 120, 40, C.line)}
      <text x={84} y={168} textAnchor="middle" fill={C.text} fontSize={12}>Клиент</text>
      <line x1={144} y1={164} x2={250} y2={164} stroke={C.mentor} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <rect x={250} y={148} width={120} height={32} rx={8} fill={C.amber} fillOpacity={0.12} stroke={C.amber} strokeWidth={1.3} />
      <text x={310} y={168} textAnchor="middle" fill={C.amber} fontSize={11} fontWeight={700}>очередь</text>
      <line x1={370} y1={164} x2={470} y2={164} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      {box(470, 144, 120, 40, C.line)}
      <text x={530} y={168} textAnchor="middle" fill={C.text} fontSize={12}>Worker</text>
      <text x={84} y={208} fill={C.sub} fontSize={10}>сразу свободен ✓</text>
    </Frame>
  );
}

function MessageQueue({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 220" label="Очередь сообщений">
      <text x={24} y={30} fill={C.text} fontSize={13} fontWeight={700}>Очередь развязывает отправителя и получателя</text>
      {box(24, 78, 120, 48, C.electric)}
      <text x={84} y={107} textAnchor="middle" fill={C.text} fontSize={12}>Producer</text>
      <line x1={144} y1={102} x2={216} y2={102} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <rect x={220} y={80} width={200} height={44} rx={10} fill={C.surface2} stroke={C.amber} strokeWidth={1.4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={232 + i * 44} y={92} width={32} height={20} rx={4} fill={C.amber} fillOpacity={0.25} stroke={C.amber} strokeWidth={1} />
      ))}
      <text x={320} y={140} textAnchor="middle" fill={C.amber} fontSize={11}>queue (FIFO)</text>
      <line x1={420} y1={102} x2={492} y2={102} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      {box(496, 78, 120, 48, C.success)}
      <text x={556} y={107} textAnchor="middle" fill={C.text} fontSize={12}>Consumer</text>
      <line x1={320} y1={124} x2={320} y2={164} stroke={C.danger} strokeWidth={1.4} strokeDasharray="4 3" markerEnd="url(#kd-arrow)" />
      <rect x={250} y={166} width={140} height={30} rx={8} fill={C.danger} fillOpacity={0.1} stroke={C.danger} strokeWidth={1.2} />
      <text x={320} y={186} textAnchor="middle" fill={C.danger} fontSize={11}>DLQ — «мёртвые» сообщения</text>
    </Frame>
  );
}

function SoapEnvelope({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 230" label="Структура SOAP Envelope">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>SOAP: строгая вложенная структура XML</text>
      <rect x={120} y={44} width={400} height={170} rx={12} fill="none" stroke={C.electric} strokeWidth={1.6} />
      <text x={138} y={64} fill={C.electric} fontSize={12} fontWeight={700}>Envelope</text>
      <rect x={146} y={74} width={348} height={42} rx={9} fill={C.surface2} stroke={C.mentor} strokeWidth={1.3} />
      <text x={162} y={92} fill={C.mentor} fontSize={12} fontWeight={600}>Header</text>
      <text x={162} y={108} fill={C.sub} fontSize={10}>метаданные, авторизация</text>
      <rect x={146} y={124} width={348} height={78} rx={9} fill={C.surface2} stroke={C.success} strokeWidth={1.3} />
      <text x={162} y={144} fill={C.success} fontSize={12} fontWeight={600}>Body</text>
      <text x={162} y={162} fill={C.sub} fontSize={10}>вызов операции (GetDebtRequest)</text>
      <rect x={300} y={168} width={180} height={26} rx={7} fill={C.danger} fillOpacity={0.1} stroke={C.danger} strokeWidth={1.2} />
      <text x={390} y={185} textAnchor="middle" fill={C.danger} fontSize={11}>Fault — контракт ошибки</text>
    </Frame>
  );
}

function AuthnVsAuthz({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 220" label="Аутентификация против авторизации">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>Сначала «кто ты», потом «что тебе можно»</text>
      {box(40, 56, 250, 130, C.electric, C.surface2)}
      <text x={165} y={86} textAnchor="middle" fill={C.electric} fontSize={14} fontWeight={700}>Аутентификация</text>
      <text x={165} y={108} textAnchor="middle" fill={C.sub} fontSize={11}>Кто ты?</text>
      <circle cx={120} cy={146} r={14} fill="none" stroke={C.electric} strokeWidth={1.6} />
      <path d={`M 134 146 h 26 v -8 l 10 8 l -10 8 v -8`} fill={C.electric} />
      <text x={196} y={150} fill={C.sub} fontSize={11}>логин · токен</text>
      <line x1={300} y1={120} x2={350} y2={120} stroke={C.sub} strokeWidth={1.8} markerEnd="url(#kd-arrow)" />
      {box(360, 56, 250, 130, C.success, C.surface2)}
      <text x={485} y={86} textAnchor="middle" fill={C.success} fontSize={14} fontWeight={700}>Авторизация</text>
      <text x={485} y={108} textAnchor="middle" fill={C.sub} fontSize={11}>Что тебе можно?</text>
      <text x={400} y={140} fill={C.sub} fontSize={11}>✓ читать заказы</text>
      <text x={400} y={160} fill={C.sub} fontSize={11}>✗ удалять чужие</text>
    </Frame>
  );
}

function OAuth2Flow({ className }: SvgProps): ReactElement {
  const node = (x: number, label: string, sub: string, color: string) => (
    <g>
      <rect x={x} y={70} width={120} height={56} rx={11} fill={C.surface2} stroke={color} strokeWidth={1.4} />
      <text x={x + 60} y={94} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={600}>{label}</text>
      <text x={x + 60} y={111} textAnchor="middle" fill={C.sub} fontSize={9.5}>{sub}</text>
    </g>
  );
  const arrow = (x1: number, x2: number, label: string) => (
    <g>
      <line x1={x1} y1={98} x2={x2} y2={98} stroke={C.sub} strokeWidth={1.6} markerEnd="url(#kd-arrow)" />
      <text x={(x1 + x2) / 2} y={90} textAnchor="middle" fill={C.sub} fontSize={9}>{label}</text>
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 180" label="Поток OAuth2 с access-токеном">
      <text x={24} y={32} fill={C.text} fontSize={13} fontWeight={700}>OAuth2: доступ по токену, без передачи пароля</text>
      {node(20, 'Клиент', 'приложение', C.electric)}
      {arrow(140, 226, 'запрос доступа')}
      {node(230, 'Auth Server', 'выдаёт токен', C.mentor)}
      {arrow(350, 436, 'access token')}
      {node(440, 'API', 'ресурс', C.success)}
      <text x={24} y={160} fill={C.sub} fontSize={11}>Токен ограничен по правам (scope) и времени жизни.</text>
    </Frame>
  );
}

function JwtStructure({ className }: SvgProps): ReactElement {
  const seg = (x: number, w: number, label: string, sub: string, color: string) => (
    <g>
      <rect x={x} y={70} width={w} height={50} rx={9} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.4} />
      <text x={x + w / 2} y={90} textAnchor="middle" fill={color} fontSize={12} fontWeight={700}>{label}</text>
      <text x={x + w / 2} y={107} textAnchor="middle" fill={C.sub} fontSize={9.5}>{sub}</text>
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 175" label="Структура JWT">
      <text x={24} y={32} fill={C.text} fontSize={13} fontWeight={700}>JWT = header . payload . signature</text>
      {seg(24, 180, 'Header', 'алгоритм, тип', C.electric)}
      <text x={212} y={100} fill={C.sub} fontSize={16}>.</text>
      {seg(224, 200, 'Payload', 'claims: кто, права, exp', C.mentor)}
      <text x={432} y={100} fill={C.sub} fontSize={16}>.</text>
      {seg(444, 172, 'Signature', 'подпись сервера', C.success)}
      <text x={24} y={150} fill={C.sub} fontSize={11}>Подпись подтверждает, что токен не подделан. Payload не шифруется — секреты не клади.</text>
    </Frame>
  );
}

function ObservabilityPillars({ className }: SvgProps): ReactElement {
  const pillar = (x: number, title: string, sub: string, color: string) => (
    <g>
      <rect x={x} y={64} width={180} height={120} rx={12} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={1.4} />
      <text x={x + 90} y={100} textAnchor="middle" fill={color} fontSize={14} fontWeight={700}>{title}</text>
      <text x={x + 90} y={126} textAnchor="middle" fill={C.sub} fontSize={11}>{sub}</text>
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 210" label="Три столпа наблюдаемости">
      <text x={24} y={32} fill={C.text} fontSize={13} fontWeight={700}>Observability стоит на трёх столпах</text>
      {pillar(24, 'Логи', 'что произошло', C.electric)}
      {pillar(230, 'Метрики', 'сколько и как быстро', C.amber)}
      {pillar(436, 'Трейсы', 'путь запроса', C.success)}
      <text x={24} y={200} fill={C.sub} fontSize={11}>Вместе они отвечают: что сломалось, насколько и где именно.</text>
    </Frame>
  );
}

function SlaSlo({ className }: SvgProps): ReactElement {
  return (
    <Frame className={className} viewBox="0 0 640 200" label="SLA, SLO и бюджет ошибок">
      <text x={24} y={30} fill={C.text} fontSize={13} fontWeight={700}>SLO — цель, бюджет ошибок — допустимый остаток</text>
      <rect x={24} y={64} width={500} height={40} rx={8} fill={C.success} fillOpacity={0.18} stroke={C.success} strokeWidth={1.2} />
      <rect x={524} y={64} width={92} height={40} rx={8} fill={C.danger} fillOpacity={0.16} stroke={C.danger} strokeWidth={1.2} />
      <text x={274} y={89} textAnchor="middle" fill={C.success} fontSize={12} fontWeight={700}>доступность 99.9% (SLO)</text>
      <text x={570} y={89} textAnchor="middle" fill={C.danger} fontSize={11}>0.1%</text>
      <text x={570} y={120} textAnchor="middle" fill={C.sub} fontSize={9.5}>бюджет ошибок</text>
      <text x={24} y={150} fill={C.sub} fontSize={11}>SLA — внешнее обещание клиенту. SLO — внутренняя цель. SLI — то, что реально измеряем.</text>
      <text x={24} y={172} fill={C.sub} fontSize={11}>Потратил бюджет ошибок — притормози релизы, занимайся надёжностью.</text>
    </Frame>
  );
}

function DistributedTracing({ className }: SvgProps): ReactElement {
  const span = (x: number, w: number, y: number, label: string, color: string) => (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={6} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.2} />
      <text x={x + 8} y={y + 15} fill={C.text} fontSize={10.5}>{label}</text>
    </g>
  );
  return (
    <Frame className={className} viewBox="0 0 640 200" label="Распределённая трассировка по trace id">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>Один trace id связывает путь запроса через сервисы</text>
      <text x={24} y={52} fill={C.electric} fontSize={11} fontFamily="monospace">trace-id: 7f3a…c2</text>
      {span(24, 580, 64, 'API Gateway', C.electric)}
      {span(70, 360, 94, 'Сервис заказов', C.mentor)}
      {span(150, 200, 124, 'Сервис платежей', C.amber)}
      {span(420, 150, 124, 'Сервис доставки', C.success)}
      <line x1={24} y1={158} x2={604} y2={158} stroke={C.line} strokeWidth={1} />
      <text x={24} y={176} fill={C.sub} fontSize={10}>время →   видно, какой сервис тормозит или падает в цепочке</text>
    </Frame>
  );
}

function RiskMatrix({ className }: SvgProps): ReactElement {
  const colors = [
    [C.success, C.amber, C.danger],
    [C.amber, C.amber, C.danger],
    [C.success, C.amber, C.danger]
  ];
  return (
    <Frame className={className} viewBox="0 0 640 230" label="Матрица рисков: вероятность на влияние">
      <text x={24} y={28} fill={C.text} fontSize={13} fontWeight={700}>Риск = вероятность × влияние</text>
      <text x={40} y={130} fill={C.sub} fontSize={11} transform="rotate(-90 40 130)">вероятность →</text>
      <text x={300} y={222} textAnchor="middle" fill={C.sub} fontSize={11}>влияние →</text>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const color = colors[row][col];
          return (
            <rect
              key={`${row}-${col}`}
              x={120 + col * 130}
              y={56 + row * 50}
              width={124}
              height={44}
              rx={8}
              fill={color}
              fillOpacity={0.16}
              stroke={color}
              strokeWidth={1.2}
            />
          );
        })
      )}
      <text x={182} y={196} textAnchor="middle" fill={C.sub} fontSize={10}>низкое</text>
      <text x={312} y={196} textAnchor="middle" fill={C.sub} fontSize={10}>среднее</text>
      <text x={442} y={196} textAnchor="middle" fill={C.sub} fontSize={10}>высокое</text>
      <text x={500} y={88} fill={C.danger} fontSize={11} fontWeight={700}>митигируй</text>
    </Frame>
  );
}

export const knowledgeDiagrams: Record<string, { title: string; Component: (props: SvgProps) => ReactElement }> = {
  'rest-request-response': { title: 'Запрос и ответ', Component: RequestResponse },
  'http-status-map': { title: 'Группы статус-кодов', Component: StatusMap },
  'endpoint-anatomy': { title: 'Анатомия эндпоинта', Component: EndpointAnatomy },
  'json-schema-gate': { title: 'JSON Schema как контроль', Component: JsonSchemaGate },
  idempotency: { title: 'Идемпотентность', Component: Idempotency },
  'http-methods-crud': { title: 'Методы и CRUD', Component: HttpMethodsCrud },
  'sql-join': { title: 'JOIN таблиц', Component: SqlJoin },
  'sql-group-by': { title: 'GROUP BY и агрегаты', Component: SqlGroupBy },
  'requirements-levels': { title: 'Уровни требований', Component: RequirementsLevels },
  'user-story': { title: 'User story и критерии', Component: UserStory },
  'use-case': { title: 'Use case', Component: UseCase },
  erd: { title: 'ERD: сущности и связи', Component: Erd },
  bpmn: { title: 'BPMN: процесс', Component: Bpmn },
  'uml-sequence': { title: 'UML sequence', Component: UmlSequence },
  'sync-async': { title: 'Синхронно и асинхронно', Component: SyncAsync },
  'message-queue': { title: 'Очередь сообщений', Component: MessageQueue },
  'soap-envelope': { title: 'SOAP Envelope', Component: SoapEnvelope },
  'authn-vs-authz': { title: 'Аутентификация и авторизация', Component: AuthnVsAuthz },
  'oauth2-flow': { title: 'Поток OAuth2', Component: OAuth2Flow },
  'jwt-structure': { title: 'Структура JWT', Component: JwtStructure },
  'observability-pillars': { title: 'Три столпа наблюдаемости', Component: ObservabilityPillars },
  'sla-slo': { title: 'SLA, SLO и бюджет ошибок', Component: SlaSlo },
  'distributed-tracing': { title: 'Распределённая трассировка', Component: DistributedTracing },
  'risk-matrix': { title: 'Матрица рисков', Component: RiskMatrix }
};

export type KnowledgeDiagramId = keyof typeof knowledgeDiagrams;
