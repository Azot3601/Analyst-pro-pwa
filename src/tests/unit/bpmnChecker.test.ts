import { describe, expect, it } from 'vitest';
import { compareBpmnGraph, type BpmnGraph } from '../../shared/lib/graphCheckers';
import { reservationBpmn } from '../../data/cases/reservationCase/referenceBpmn';

// Валидный процесс: start → task → gateway(неявка?) → [штраф]/[усадить] → end.
const validGraph: BpmnGraph = {
  nodes: [
    { id: 's', kind: 'start', label: 'Бронь создана' },
    { id: 't1', kind: 'task', label: 'Ожидание гостя' },
    { id: 'g', kind: 'gateway-x', label: 'Гость не пришёл?' },
    { id: 't2', kind: 'task', label: 'Усадить гостя' },
    { id: 't3', kind: 'task', label: 'Выставить штраф' },
    { id: 'e', kind: 'end', label: 'Конец' }
  ],
  edges: [
    { from: 's', to: 't1' },
    { from: 't1', to: 'g' },
    { from: 'g', to: 't2' },
    { from: 'g', to: 't3' },
    { from: 't2', to: 'e' },
    { from: 't3', to: 'e' }
  ]
};

const clone = (g: BpmnGraph): BpmnGraph => JSON.parse(JSON.stringify(g));

describe('compareBpmnGraph', () => {
  it('accepts a valid process with the no-show exception branch', () => {
    expect(compareBpmnGraph(validGraph, reservationBpmn).ok).toBe(true);
  });

  it('flags a missing required node kind', () => {
    const sub = clone(validGraph);
    sub.nodes = sub.nodes.filter((n) => n.kind !== 'gateway-x');
    const result = compareBpmnGraph(sub, reservationBpmn);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((d) => d.code)).toContain('bpmn-missing-node');
  });

  it('flags a node that cannot reach the end', () => {
    const sub = clone(validGraph);
    sub.edges = sub.edges.filter((e) => !(e.from === 't3' && e.to === 'e'));
    const result = compareBpmnGraph(sub, reservationBpmn);
    expect(result.diagnostics.map((d) => d.code)).toContain('bpmn-unreachable-end');
  });

  it('flags a missing exception branch (no no-show condition)', () => {
    const sub = clone(validGraph);
    sub.nodes.find((n) => n.id === 'g')!.label = 'Проверка';
    const result = compareBpmnGraph(sub, reservationBpmn);
    expect(result.diagnostics.map((d) => d.code)).toContain('bpmn-missing-exception');
  });
});
