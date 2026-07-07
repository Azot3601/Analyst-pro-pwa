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
  type Node,
  type NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckCircle2, Network, Plus, RotateCcw, X } from 'lucide-react';
import { reservationErd, reservationErdTask } from '../../../data/cases/reservationCase/referenceErd';
import { markTaskSolved, recordReview } from '../../progress/progressDb';
import { compareErdGraph, type Cardinality, type ErdGraph } from '../../../shared/lib/graphCheckers';
import { playError, playSuccess } from '../../../shared/lib/audio';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

const ERD_TASK_ID = 'erd-reservation';

type EntityData = {
  name: string;
  fields: string;
  onChange: (patch: Partial<{ name: string; fields: string }>) => void;
  onDelete: () => void;
};
type RelationData = { cardinality: Cardinality; onChange: (id: string, value: Cardinality) => void; onDelete: (id: string) => void };

// Узел = сущность с полями внутри (textarea «имя: тип»), а не отдельные фигуры.
function EntityNode({ data }: NodeProps<EntityData>) {
  return (
    <div className="group relative w-52 rounded-lg border border-electric/40 bg-graphite/95 p-2 shadow-lift">
      <Handle type="target" position={Position.Left} className="!bg-electric" />
      <button
        onClick={data.onDelete}
        title="Удалить сущность"
        className="nodrag absolute -right-2 -top-2 z-10 grid size-5 place-items-center rounded-full border border-white/20 bg-graphite text-slate-400 hover:border-danger/50 hover:text-danger"
      >
        <X size={12} />
      </button>
      <input
        value={data.name}
        onChange={(event) => data.onChange({ name: event.target.value })}
        placeholder="имя сущности"
        className="nodrag mb-1 w-full bg-transparent text-xs font-bold text-electric outline-none"
      />
      <textarea
        value={data.fields}
        onChange={(event) => data.onChange({ fields: event.target.value })}
        rows={5}
        placeholder={'id: integer\nname: text'}
        className="nodrag w-full resize-none rounded bg-black/30 p-1 font-mono text-[11px] leading-4 text-slate-200 outline-none"
      />
      <Handle type="source" position={Position.Right} className="!bg-electric" />
    </div>
  );
}

// Ребро с dropdown кардинальности и кнопкой удаления прямо на связи.
function RelationEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<RelationData>) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: '#6ea8fe', strokeWidth: 1.5 }} />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: 'all' }}
          className="nodrag nopan flex items-center gap-1"
        >
          <select
            value={data?.cardinality ?? '1-N'}
            onChange={(event) => data?.onChange(id, event.target.value as Cardinality)}
            className="rounded border border-electric/40 bg-graphite px-1 py-0.5 text-[11px] font-semibold text-electric"
          >
            <option value="1-1">1-1</option>
            <option value="1-N">1-N</option>
            <option value="N-N">N-N</option>
          </select>
          <button
            onClick={() => data?.onDelete(id)}
            title="Удалить связь"
            className="grid size-4 place-items-center rounded-full border border-white/20 bg-graphite text-slate-400 hover:border-danger/50 hover:text-danger"
          >
            <X size={10} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const parseFields = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, type] = line.split(':').map((part) => part.trim());
      return { name: name ?? '', type: type ?? '' };
    });

// Стартовые узлы: имена сущностей заданы, поля и связи проектирует ученик.
const seedNames = ['guests', 'restaurant_tables', 'reservations', 'penalties'];
const positions = [
  { x: 40, y: 40 },
  { x: 340, y: 40 },
  { x: 190, y: 250 },
  { x: 190, y: 460 }
];

function ErdCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<EntityData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RelationData>([]);
  const [result, setResult] = useState<ReturnType<typeof compareErdGraph> | null>(null);
  const [solved, setSolved] = useState(false);

  const updateNode = useCallback(
    (id: string, patch: Partial<{ name: string; fields: string }>) =>
      setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...patch } } : node))),
    [setNodes]
  );

  const updateEdge = useCallback(
    (id: string, cardinality: Cardinality) =>
      setEdges((current) => current.map((edge) => (edge.id === id ? { ...edge, data: { ...edge.data!, cardinality } } : edge))),
    [setEdges]
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
    (id: string, name: string, fields: string): EntityData => ({
      name,
      fields,
      onChange: (patch) => updateNode(id, patch),
      onDelete: () => deleteNode(id)
    }),
    [updateNode, deleteNode]
  );

  // Инициализация один раз.
  useEffect(() => {
    setNodes(
      seedNames.map((name, index): Node<EntityData> => ({
        id: `n${index}`,
        type: 'entity',
        position: positions[index],
        data: nodeData(`n${index}`, name, '')
      }))
    );
  }, [setNodes, nodeData]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) =>
        addEdge({ ...connection, type: 'relation', data: { cardinality: '1-N', onChange: updateEdge, onDelete: deleteEdge } }, current)
      ),
    [setEdges, updateEdge, deleteEdge]
  );

  const addEntity = () =>
    setNodes((current) => {
      const id = `n${current.length}-${Date.now()}`;
      return [...current, { id, type: 'entity', position: { x: 500, y: 250 }, data: nodeData(id, '', '') }];
    });

  const reset = () => {
    setEdges([]);
    setResult(null);
    setSolved(false);
    setNodes(
      seedNames.map((name, index): Node<EntityData> => ({
        id: `n${index}`,
        type: 'entity',
        position: positions[index],
        data: nodeData(`n${index}`, name, '')
      }))
    );
  };

  const check = async () => {
    const nameById = new Map(nodes.map((node) => [node.id, node.data.name]));
    const graph: ErdGraph = {
      entities: nodes.map((node) => ({ name: node.data.name, fields: parseFields(node.data.fields) })),
      relations: edges.map((edge) => ({
        from: nameById.get(edge.source) ?? edge.source,
        to: nameById.get(edge.target) ?? edge.target,
        cardinality: edge.data?.cardinality ?? '1-N'
      }))
    };
    const outcome = compareErdGraph(graph, reservationErd);
    setResult(outcome);
    if (outcome.ok) {
      playSuccess();
      setSolved(true);
      await markTaskSolved(ERD_TASK_ID).catch(() => undefined);
      void recordReview('erd:reservation', true).catch(() => undefined);
    } else {
      playError();
      void recordReview('erd:reservation', false).catch(() => undefined);
    }
  };

  const nodeTypes = useMemo(() => ({ entity: EntityNode }), []);
  const edgeTypes = useMemo(() => ({ relation: RelationEdge }), []);

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
          <p className="text-sm leading-6 text-slate-300">{reservationErdTask}</p>
          <div className="mt-3 rounded-lg border border-electric/20 bg-electric/[0.05] p-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-electric/80">Что нужно сделать</div>
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-5 text-slate-300">
              <li>Заполни поля каждой сущности в формате <span className="font-mono text-slate-200">имя: тип</span> (по одному на строку).</li>
              <li>Соедини связанные сущности линией.</li>
              <li>На каждой связи выбери кардинальность: 1-1, 1-N или N-N.</li>
            </ol>
          </div>
          <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">
            <div className="mb-1 font-semibold text-slate-300">Как управлять</div>
            <div>• Связь: тяни от <b>правого</b> кружка одной сущности к <b>левому</b> кружку другой.</div>
            <div>• Удалить сущность или связь: кнопка <b>×</b> на ней (или выдели и нажми Delete).</div>
            <div>• Направление 1-N: тяни от стороны «один» к стороне «много».</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="soft" onClick={addEntity}>
              <Plus size={15} /> Сущность
            </Button>
            <Button onClick={check}>
              <Network size={15} /> Проверить
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw size={15} /> Сбросить
            </Button>
          </div>
        </Panel>

        {solved && (
          <Panel className="border-success/30 bg-success/[0.06]">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 size={16} /> ERD совпал с эталоном — модель верна.
            </div>
          </Panel>
        )}

        {result && !result.ok && (
          <Panel title="Что поправить">
            <ul className="space-y-2 text-xs">
              {result.diagnostics.map((d, index) => (
                <li key={index} className={`rounded-lg border p-2 ${d.severity === 'warning' ? 'border-amber/30 bg-amber/[0.06] text-amber' : 'border-danger/30 bg-danger/[0.06] text-danger'}`}>
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

export function ErdWorkspace() {
  return (
    <ReactFlowProvider>
      <ErdCanvas />
    </ReactFlowProvider>
  );
}
