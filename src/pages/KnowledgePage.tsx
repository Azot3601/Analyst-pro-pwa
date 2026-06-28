import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { knowledgeNodes } from '../data/knowledge';
import { tasks } from '../data/tasks';
import { Panel } from '../shared/ui/Panel';

const relationColor: Record<string, string> = {
  prerequisite: '#8b7bff',
  related: '#b3a4ff',
  used_in: '#57d9a3',
  common_mistake: '#ff7a93',
  example: '#ffce6a',
  contrasts_with: '#f472b6'
};

export function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(knowledgeNodes[0].id);
  const selected = knowledgeNodes.find((node) => node.id === selectedId) ?? knowledgeNodes[0];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return knowledgeNodes.filter((node) =>
      [node.title, node.summary, node.tags.join(' ')].join(' ').toLowerCase().includes(q)
    );
  }, [query]);

  const graph = useMemo(() => {
    const firstNodes = filtered.slice(0, 32);
    const selectedNeighborhoodIds = new Set([selectedId]);
    knowledgeNodes
      .find((node) => node.id === selectedId)
      ?.related.forEach((relation) => selectedNeighborhoodIds.add(relation.id));
    const visibleMap = new Map(firstNodes.map((node) => [node.id, node]));
    filtered
      .filter((node) => selectedNeighborhoodIds.has(node.id))
      .forEach((node) => visibleMap.set(node.id, node));
    const visible = Array.from(visibleMap.values());
    const nodes: Node[] = visible.map((node, index) => ({
      id: node.id,
      position: {
        x: 90 + (index % 6) * 170,
        y: 70 + Math.floor(index / 6) * 110
      },
      data: { label: node.title },
      className: node.id === selectedId ? '!border-electric !text-electric' : ''
    }));
    const ids = new Set(visible.map((node) => node.id));
    const edges: Edge[] = visible.flatMap((node) =>
      node.related
        .filter((relation) => ids.has(relation.id))
        .map((relation) => ({
          id: `${node.id}-${relation.id}-${relation.relation}`,
          source: node.id,
          target: relation.id,
          label: relation.relation,
          animated: node.id === selectedId,
          style: { stroke: relationColor[relation.relation] ?? '#8b7bff' }
        }))
    );
    return { nodes, edges };
  }, [filtered, selectedId]);

  const relatedTasks = tasks.filter((task) => task.relatedKnowledgeIds.includes(selected.id)).slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Panel title="База знаний">
        <label className="relative block">
          <Search className="absolute left-3 top-3 text-slate-500" size={16} />
          <input
            className="w-full rounded-md border border-white/10 bg-ink py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-electric"
            placeholder="Поиск по терминам, тегам, кейсам"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="mt-4 max-h-[70vh] space-y-2 overflow-auto pr-1">
          {filtered.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              className={`w-full rounded-md border p-3 text-left text-sm transition ${
                selectedId === node.id
                  ? 'border-electric bg-electric/10 text-electric'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
              }`}
            >
              <div className="font-semibold">{node.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-slate-400">{node.summary}</div>
            </button>
          ))}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Граф знаний">
          <div className="mb-3 text-xs text-slate-400">
            Показано {graph.nodes.length} из {filtered.length} узлов. Выбранный узел и его ближайшие связи всегда добавляются в граф.
          </div>
          <div className="h-[440px] overflow-hidden rounded-lg border border-white/10 bg-ink/70">
            <ReactFlow
              nodes={graph.nodes}
              edges={graph.edges}
              fitView
              onNodeClick={(_, node) => setSelectedId(node.id)}
            >
              <Background color="#322b46" gap={24} />
              <MiniMap pannable zoomable nodeColor="#221d34" maskColor="rgba(20,18,30,0.74)" />
              <Controls />
            </ReactFlow>
          </div>
        </Panel>

        <Panel
          title={selected.title}
          action={
            <button className="grid size-9 place-items-center rounded-md border border-white/10 bg-white/[0.08] text-amber">
              <Star size={16} />
            </button>
          }
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {selected.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm leading-6 text-slate-300">{selected.fullText}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-success">Примеры</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {selected.examples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-danger">Антипримеры</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {selected.antiExamples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-electric">Связанные задачи</h3>
            <div className="flex flex-wrap gap-2">
              {relatedTasks.map((task) => (
                <Link
                  key={task.id}
                  to="/trainer"
                  className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:border-electric hover:text-electric focus:outline-none focus:ring-2 focus:ring-electric/70"
                >
                  {task.title}
                </Link>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
