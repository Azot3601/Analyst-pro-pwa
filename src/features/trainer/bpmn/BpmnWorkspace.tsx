import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type EdgeProps,
  type NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckCircle2, GitBranch, Plus, RotateCcw, X } from 'lucide-react';
import { reservationBpmn } from '../../../data/cases/reservationCase/referenceBpmn';
import { markTaskSolved, recordReview } from '../../progress/progressDb';
import { compareBpmnGraph, type BpmnGraph, type BpmnNodeKind } from '../../../shared/lib/graphCheckers';
import { playError, playSuccess } from '../../../shared/lib/audio';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

const BPMN_TASK_ID = 'bpmn-reservation';

type BpmnData = { kind: BpmnNodeKind; label: string; onChange: (label: string) => void; onDelete: () => void };
type FlowData = { onDelete: (id: string) => void };

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
    <div className={`relative w-40 rounded-lg border p-2 shadow-lift ${kindStyle[data.kind]}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-300" />
      <button
        onClick={data.onDelete}
        title="Удалить узел"
        className="nodrag absolute -right-2 -top-2 z-10 grid size-5 place-items-center rounded-full border border-white/20 bg-graphite text-slate-400 hover:border-danger/50 hover:text-danger"
      >
        <X size={12} />
      </button>
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

// Ребро-поток с кнопкой удаления на середине.
function FlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<FlowData>) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: '#94a3b8', strokeWidth: 1.5 }} />
      <EdgeLabelRenderer>
        <button
          onClick={() => data?.onDelete(id)}
          title="Удалить связь"
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: 'all' }}
          className="nodrag nopan grid size-4 place-items-center rounded-full border border-white/20 bg-graphite text-slate-400 hover:border-danger/50 hover:text-danger"
        >
          <X size={10} />
        </button>
      </EdgeLabelRenderer>
    </>
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

  const deleteEdge = useCallback((id: string) => setEdges((current) => current.filter((edge) => edge.id !== id)), [setEdges]);

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
    },
    [setNodes, setEdges]
  );

  const nodeData = useCallback(
    (id: string, kind: BpmnNodeKind, label: string): BpmnData => ({
      kind,
      label,
      onChange: (l) => updateNode(id, l),
      onDelete: () => deleteNode(id)
    }),
    [updateNode, deleteNode]
  );

  const seed = useCallback(
    () => [
      { id: 'start', type: 'bpmn', position: { x: 40, y: 220 }, data: nodeData('start', 'start', 'Бронь создана') },
      { id: 'end', type: 'bpmn', position: { x: 620, y: 220 }, data: nodeData('end', 'end', 'Конец') }
    ],
    [nodeData]
  );

  // Предзаданы старт и конец — процесс между ними строит ученик.
  useEffect(() => {
    setNodes(seed());
  }, [setNodes, seed]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge({ ...connection, type: 'flow', data: { onDelete: deleteEdge } }, current)),
    [setEdges, deleteEdge]
  );

  const addNode = (kind: BpmnNodeKind) =>
    setNodes((current) => {
      const id = `${kind}-${current.length}-${Date.now()}`;
      const y = 60 + (current.length % 5) * 90;
      return [...current, { id, type: 'bpmn', position: { x: 300, y }, data: nodeData(id, kind, '') }];
    });

  const reset = () => {
    setEdges([]);
    setResult(null);
    setSolved(false);
    setNodes(seed());
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
  const edgeTypes = useMemo(() => ({ flow: FlowEdge }), []);

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
          edgeTypes={edgeTypes}
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
          <div className="mt-3 rounded-lg border border-electric/20 bg-electric/[0.05] p-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-electric/80">Что нужно сделать</div>
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-5 text-slate-300">
              <li>Добавь между «Старт» и «Конец» задачи и исключающий шлюз (◇ X-шлюз).</li>
              <li>На X-шлюзе впиши условие про неявку (например «гость не пришёл?»).</li>
              <li>Сделай ветку-исключение: по неявке — задача «выставить штраф».</li>
              <li>Соедини узлы так, чтобы каждый путь заканчивался на «Конец».</li>
            </ol>
          </div>
          <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">
            <div className="mb-1 font-semibold text-slate-300">Как управлять</div>
            <div>• Добавить узел — кнопки палитры ниже.</div>
            <div>• Связь: тяни от <b>правого</b> кружка узла к <b>левому</b> кружку следующего.</div>
            <div>• Удалить узел или связь: кнопка <b>×</b> на ней (или выдели и нажми Delete).</div>
          </div>
          <div className="mt-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Палитра</div>
          <div className="flex flex-wrap gap-1.5">
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
