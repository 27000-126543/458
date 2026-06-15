import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Play,
  ShieldCheck,
  GitBranch,
  Users,
  ArrowRightLeft,
  Square,
  Save,
  TestTube2,
  Trash2,
  GripVertical,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowNode {
  id: string;
  type: "start" | "approval" | "condition" | "countersign" | "transfer" | "end";
  name: string;
  approverIds: string[];
  position: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface ApprovalFlow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const nodeTypes: { type: FlowNode["type"]; label: string; icon: typeof Play; color: string }[] = [
  { type: "start", label: "开始", icon: Play, color: "text-emerald-400 bg-emerald-400/10" },
  { type: "approval", label: "审批", icon: ShieldCheck, color: "text-blue-400 bg-blue-400/10" },
  { type: "condition", label: "条件分支", icon: GitBranch, color: "text-amber-400 bg-amber-400/10" },
  { type: "countersign", label: "会签", icon: Users, color: "text-cyan-400 bg-cyan-400/10" },
  { type: "transfer", label: "转审", icon: ArrowRightLeft, color: "text-purple-400 bg-purple-400/10" },
  { type: "end", label: "结束", icon: Square, color: "text-slate-400 bg-slate-400/10" },
];

function PaletteItem({ type, label, icon: Icon, color }: { type: FlowNode["type"]; label: string; icon: typeof Play; color: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-700/50 bg-slate-800/50 cursor-grab hover:border-slate-600/50 transition-all",
        isDragging && "opacity-50"
      )}
    >
      <GripVertical className="w-3.5 h-3.5 text-slate-600" />
      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}

function CanvasNode({
  node,
  isSelected,
  onClick,
}: {
  node: FlowNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `canvas-${node.id}`,
    data: { nodeId: node.id, fromCanvas: true },
  });

  const typeInfo = nodeTypes.find((t) => t.type === node.type) || nodeTypes[0];
  const Icon = typeInfo.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "absolute w-44 glass-card p-3 cursor-pointer transition-all duration-200",
        isSelected && "ring-2 ring-blue-400/60 shadow-lg shadow-blue-400/10",
        isDragging && "opacity-70 scale-105 z-50"
      )}
      style={{ left: node.position.x, top: node.position.y }}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeInfo.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-200 truncate">{node.name}</span>
      </div>
      {node.approverIds.length > 0 && (
        <p className="text-xs text-slate-500 mt-1.5 pl-10">{node.approverIds.length} 位审批人</p>
      )}
    </div>
  );
}

function ConnectionLines({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#64748B" />
        </marker>
      </defs>
      {edges.map((edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return null;
        const sx = source.position.x + 88;
        const sy = source.position.y + 20;
        const tx = target.position.x;
        const ty = target.position.y + 20;
        return (
          <line
            key={edge.id}
            x1={sx}
            y1={sy}
            x2={tx}
            y2={ty}
            stroke="#475569"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
            strokeDasharray={edge.label ? "6 3" : undefined}
          />
        );
      })}
    </svg>
  );
}

export default function ApprovalDesigner() {
  const [flow, setFlow] = useState<ApprovalFlow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/approval-flows")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const f = json.data[0];
          setFlow(f);
          setNodes(f.nodes);
          setEdges(f.edges);
        }
      })
      .catch(() => {});
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedId);

  const addNode = useCallback(
    (type: FlowNode["type"]) => {
      const id = `node_${Date.now()}`;
      const typeInfo = nodeTypes.find((t) => t.type === type);
      const newNode: FlowNode = {
        id,
        type,
        name: typeInfo?.label || type,
        approverIds: [],
        position: { x: 100 + Math.random() * 400, y: 80 + Math.random() * 300 },
      };
      setNodes((prev) => [...prev, newNode]);
    },
    []
  );

  const updateNode = useCallback((id: string, updates: Partial<FlowNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, delta } = event;
    const data = active.data.current;

    if (data?.fromCanvas) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === data.nodeId
            ? { ...n, position: { x: n.position.x + delta.x, y: n.position.y + delta.y } }
            : n
        )
      );
    } else if (data?.fromPalette) {
      addNode(data.type);
    }
  };

  const handleSave = async () => {
    if (!flow) return;
    await fetch(`/api/approval-flows/${flow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, edges }),
    });
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
  };

  const { setNodeRef } = useDroppable({ id: "canvas" });

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-7rem)] gap-4 animate-fade-in">
        <div className="w-52 glass-card p-4 flex flex-col gap-3 shrink-0">
          <h3 className="text-sm font-medium text-slate-300 mb-1">节点面板</h3>
          {nodeTypes.map((nt) => (
            <PaletteItem key={nt.type} {...nt} />
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div
            ref={setNodeRef}
            className="flex-1 glass-card relative overflow-auto scrollbar-thin"
          >
            <ConnectionLines nodes={nodes} edges={edges} />
            {nodes.map((node) => (
              <CanvasNode
                key={node.id}
                node={node}
                isSelected={selectedId === node.id}
                onClick={() => setSelectedId(node.id)}
              />
            ))}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-600 text-sm">拖拽左侧节点到画布开始设计</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <TestTube2 className="w-4 h-4" />
              测试
            </button>
            <button onClick={handleClear} className="btn-secondary flex items-center gap-2 text-red-400">
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>
        </div>

        <div className="w-64 glass-card p-4 shrink-0 overflow-y-auto scrollbar-thin">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">节点属性</h3>
                <button onClick={() => setSelectedId(null)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">节点名称</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">节点类型</label>
                <select
                  value={selectedNode.type}
                  onChange={(e) => updateNode(selectedNode.id, { type: e.target.value as FlowNode["type"] })}
                  className="input-dark"
                >
                  {nodeTypes.map((nt) => (
                    <option key={nt.type} value={nt.type}>{nt.label}</option>
                  ))}
                </select>
              </div>
              {(selectedNode.type === "approval" || selectedNode.type === "countersign") && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">审批人数</label>
                  <input
                    type="number"
                    min={0}
                    value={selectedNode.approverIds.length}
                    readOnly
                    className="input-dark"
                  />
                  <p className="text-xs text-slate-600 mt-1">在流程配置中设置审批人</p>
                </div>
              )}
              {selectedNode.type === "condition" && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">条件说明</label>
                  <textarea
                    placeholder="输入分支条件..."
                    className="input-dark resize-none h-20"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-500 mb-1">坐标位置</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-600">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.position.x)}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          position: { ...selectedNode.position, x: Number(e.target.value) },
                        })
                      }
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.position.y)}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          position: { ...selectedNode.position, y: Number(e.target.value) },
                        })
                      }
                      className="input-dark"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <GitBranch className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">点击画布中的节点</p>
              <p className="text-xs text-slate-600 mt-1">查看和编辑节点属性</p>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeId?.startsWith("palette-") ? (
          <div className="glass-card p-2 px-3 opacity-80 text-sm text-slate-300">
            {nodeTypes.find((n) => `palette-${n.type}` === activeId)?.label || ""}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
