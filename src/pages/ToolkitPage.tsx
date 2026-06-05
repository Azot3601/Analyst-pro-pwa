import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Copy, Play, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toolkitItems } from '../data/toolkit';
import { buildCurl } from '../shared/lib/apiSimulator';
import { diffJson, formatJson, generateExampleFromSchema, parseJson, validateJsonSchema } from '../shared/lib/jsonTools';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';

const categories = [
  ['json', 'JSON-инструменты'],
  ['api', 'API-инструменты'],
  ['requirements', 'Требования'],
  ['sql', 'SQL'],
  ['integration', 'Интеграции'],
  ['nfr', 'НФТ'],
  ['decision', 'Decision Log / ADR']
] as const;

export function ToolkitPage() {
  const [category, setCategory] = useState<(typeof categories)[number][0]>('json');
  const items = useMemo(() => toolkitItems.filter((item) => item.category === category), [category]);
  const [activeId, setActiveId] = useState('json-formatter');
  const active = toolkitItems.find((item) => item.id === activeId) ?? items[0] ?? toolkitItems[0];
  const [input, setInput] = useState('{"orderId":"ord-1001","status":"paid","delivery":null}');
  const [secondInput, setSecondInput] = useState('{"orderId":"ord-1001","status":"paid","delivery":{"status":"accepted"}}');
  const [output, setOutput] = useState(active.template);

  const selectTool = (item: typeof active) => {
    setActiveId(item.id);
    setOutput(item.template);
    if (item.title === 'JSON Schema validator') {
      setInput('{"orderId":"ord-1001","status":"paid","delivery":null}');
      setSecondInput('{"type":"object","required":["orderId","status"],"properties":{"orderId":{"type":"string"},"status":{"type":"string"},"delivery":{"type":["object","null"]}}}');
    }
    if (item.title === 'Генератор примера по Schema') {
      setInput('{"type":"object","properties":{"orderId":{"type":"string"},"total":{"type":"integer"},"paid":{"type":"boolean"}}}');
    }
  };

  const runTool = () => {
    if (active.title === 'JSON formatter') {
      const result = formatJson(input);
      setOutput(result.value ?? result.message);
      return;
    }
    if (active.title === 'JSON validator') {
      const result = parseJson(input);
      setOutput(`${result.message}\n${result.details?.join('\n') ?? ''}`);
      return;
    }
    if (active.title === 'JSON diff') {
      const result = diffJson(input, secondInput);
      setOutput(result.value?.join('\n') ?? result.message);
      return;
    }
    if (active.title === 'JSON Schema validator') {
      const result = validateJsonSchema(input, secondInput);
      setOutput(`${result.message}\n${result.details?.join('\n') ?? ''}`);
      return;
    }
    if (active.title === 'Генератор примера по Schema') {
      const result = generateExampleFromSchema(input);
      setOutput(result.value ?? result.message);
      return;
    }
    if (active.title === 'curl builder') {
      setOutput(
        buildCurl({
          method: 'GET',
          path: '/api/v1/orders',
          headers: { Accept: 'application/json' },
          query: { status: 'paid', page: '1', size: '10' }
        })
      );
      return;
    }
    if (active.title === 'Availability calculator') {
      const value = Number(input.replace(',', '.')) || 99.9;
      const downtimeMinutes = ((100 - value) / 100) * 365 * 24 * 60;
      setOutput(`SLA ${value}% допускает примерно ${downtimeMinutes.toFixed(1)} минут недоступности в год.`);
      return;
    }
    if (active.title === 'Ambiguity detector') {
      const risky = ['быстро', 'удобно', 'нормально', 'оптимально', 'по возможности'].filter((word) =>
        input.toLowerCase().includes(word)
      );
      setOutput(risky.length ? `Найдены неоднозначные слова: ${risky.join(', ')}` : 'Явных слов риска не найдено.');
      return;
    }
    setOutput(active.template);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
      <Panel title="Инструментарий">
        <div className="mb-4 space-y-2">
          {categories.map(([id, label]) => (
            <button
              key={id}
              className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm ${
                category === id ? 'border-electric bg-electric/10 text-electric' : 'border-white/10 bg-white/[0.03] text-slate-300'
              }`}
              onClick={() => {
                setCategory(id);
                const nextTool = toolkitItems.find((item) => item.category === id);
                if (nextTool) selectTool(nextTool);
              }}
            >
              <Wrench size={15} />
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                selectTool(item);
              }}
              className={`w-full rounded-md border p-3 text-left text-sm ${
                active.id === item.id ? 'border-mentor bg-mentor/10 text-mentor' : 'border-white/10 bg-white/[0.03] text-slate-300'
              }`}
            >
              <div className="font-semibold">{item.title}</div>
              <div className="mt-1 text-xs text-slate-400">{item.description}</div>
            </button>
          ))}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title={active.title}>
          <p className="mb-4 text-sm text-slate-400">{active.description}</p>
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">{active.inputLabel ?? 'Входные данные'}</label>
              <CodeMirror value={input} height="260px" extensions={[json()]} theme="dark" onChange={setInput} />
              {['JSON diff', 'JSON Schema validator'].includes(active.title) && (
                <div className="mt-3">
                  <label className="mb-2 block text-sm text-slate-300">Второй JSON / Schema</label>
                  <CodeMirror value={secondInput} height="180px" extensions={[json()]} theme="dark" onChange={setSecondInput} />
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Результат</label>
              <pre className="min-h-[260px] overflow-auto rounded-md border border-white/10 bg-ink p-3 text-sm leading-6 text-slate-300">
                {output}
              </pre>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={runTool}>
              <Play size={16} /> Выполнить локально
            </Button>
            <Button variant="soft" onClick={() => navigator.clipboard?.writeText(output)}>
              <Copy size={16} /> Скопировать
            </Button>
          </div>
        </Panel>

        <Panel title="Чеклист качества">
          <ul className="grid gap-2 md:grid-cols-2">
            {active.checklist.map((item) => (
              <li key={item} className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
