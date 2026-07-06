import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckCircle2, GitBranch, Plus, RotateCcw } from 'lucide-react';
import { reservationBpmn } from '../../../data/cases/reservationCase/referenceBpmn';
import { markTaskSolved, recordReview } from '../../progress/progressDb';
import { compareBpmnGraph, type BpmnGraph, type BpmnNodeKind } from '../../../shared/lib/graphCheckers';
import { playError, playSuccess } from '../../../shared/lib/audio';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

const BPMN_TASK_ID = 'bpmn-reservation';

type BpmnData = { kind: BpmnNodeKind; label: string; onChange: (label: string) => void };

const palette: Array<{ kind: BpmnNodeKind; label: string }> = [
  { kind: 'start', label: 'Старт' },
  { kind: 'task', label: 'Задача' },
  { kind: 'gateway-x', label: 'Исключ. шлюз' },
  { kind: 'gateway-parallel', label: 'Паралл. шлюз' },
  { kind: 'exception', label: 'Исключение' },
  { kind: 'end', label: 'Конец' }
];

const kindStyle: Record<BpmnNodeKind, string> = {
  start: 'border-success/50 bg-success/15',
  end: 'border-danger/50 bg-danger/15',
  task: 'border-electric/40 bg-graphite/95',
  'gateway-x': 'border-amber/50 bg-amber/10',
  'gateway-parallel': 'border-mentor/50 bg-mentor/10',
  exception: 'border-danger/50 bg-danger/10'
};

const kindTag: Record<BpmnNodeKind, string> = {
  start: '● старт',
  end: '◉ конец',
  task: '▭ задача',
  'gateway-x': '◇ X-шлюз',
  'gateway-parallel': '◇ +-шлюз',
  exception: '⚠ исключение'
};

function BpmnNodeView({ data }: NodeProps<BpmnData>) {
  return (
    <div className={`w-40 rounded-lg border p-2 shadow-lift ${kindStyle[data.kind]}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-300" />
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{kindTag[data.kind]}</div>
      <input
        value={data.label}
        onChange={(event) => data.onChange(event.target.value)}
        placeholder={data.kind === 'gateway-x' ? 'условие? (напр. неявка?)' : 'название'}
        className="nodrag w-full bg-transparent text-xs font-semibold text-slate-100 outline-none"
      />
      <Handle type="source" position={Position.Right} className="!bg-slate-300" />
    </div>
  );
}

function BpmnCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<BpmnData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [result, setResult] = useState<ReturnType<typeof compareBpmnGraph> | null>(null);
  const [solved, setSolved] = useState(false);

  const updateNode = useCallback(
    (id: string, label: string) =>
      setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: { ...node.data, label } } : node))),
    [setNodes]
  );

  // Предзаданы старт и конец — процесс между ними строит ученик.
  useEffect(() => {
    setNodes([
      { id: 'start', type: 'bpmn', position: { x: 40, y: 220 }, data: { kind: 'start', label: 'Бронь создана', onChange: (l) => updateNode('start', l) } },
      { id: 'end', type: 'bpmn', position: { x: 620, y: 220 }, data: { kind: 'end', label: 'Конец', onChange: (l) => updateNode('end', l) } }
    ]);
  }, [setNodes, updateNode]);

  const onConnect = useCallback((connection: Connection) => setEdges((current) => addEdge(connection, current)), [setEdges]);

  const addNode = (kind: BpmnNodeKind) =>
    setNodes((current) => {
      const id = `${kind}-${current.length}`;
      const y = 60 + (current.length % 5) * 90;
      return [...current, { id, type: 'bpmn', position: { x: 300, y }, data: { kind, label: '', onChange: (l) => updateNode(id, l) } }];
    });

  const reset = () => {
    setEdges([]);
    setResult(null);
    setSolved(false);
    setNodes((current) => current.filter((n) => n.id === 'start' || n.id === 'end'));
  };

  const check = async () => {
    const graph: BpmnGraph = {
      nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, label: n.data.label })),
      edges: edges.map((e) => ({ from: e.source, to: e.target }))
    };
    const outcome = compareBpmnGraph(graph, reservationBpmn);
    setResult(outcome);
    if (outcome.ok) {
      playSuccess();
      setSolved(true);
      await markTaskSolved(BPMN_TASK_ID).catch(() => undefined);
      void recordReview('bpmn:reservation', true).catch(() => undefined);
    } else {
      playError();
      void recordReview('bpmn:reservation', false).catch(() => undefined);
    }
  };

  const nodeTypes = useMemo(() => ({ bpmn: BpmnNodeView }), []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="h-[560px] overflow-hidden rounded-xl border border-white/10 bg-ink/60">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="space-y-3">
        <Panel title="Задача">
          <p className="text-sm leading-6 text-slate-300">{reservationBpmn.task}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {palette.map((item) => (
              <button
                key={item.kind}
                onClick={() => addNode(item.kind)}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-200 transition hover:bg-white/[0.09]"
              >
                <Plus size={12} /> {item.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={check}>
              <GitBranch size={15} /> Проверить
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw size={15} /> Сбросить
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Тяни связи от правого края узла к левому краю следующего.</p>
        </Panel>

        {solved && (
          <Panel className="border-success/30 bg-success/[0.06]">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 size={16} /> Процесс верный: есть ветка-исключение и все пути ведут к концу.
            </div>
          </Panel>
        )}

        {result && !result.ok && (
          <Panel title="Что поправить">
            <ul className="space-y-2 text-xs">
              {result.diagnostics.map((d, index) => (
                <li key={index} className="rounded-lg border border-danger/30 bg-danger/[0.06] p-2 text-danger">
                  <div className="font-semibold">{d.why}</div>
                  <div className="mt-0.5 text-slate-400">{d.fix}</div>
                  {d.details && (
                    <ul className="mt-1 list-disc pl-4 text-slate-400">
                      {d.details.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}

export function BpmnWorkspace() {
  return (
    <ReactFlowProvider>
      <BpmnCanvas />
    </ReactFlowProvider>
  );
}
