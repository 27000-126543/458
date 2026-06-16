import { useState, useEffect, useCallback, useRef } from "react";
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
  Link,
  Unlink,
  Edit3,
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
  isConnecting,
  onClick,
  onConnectStart,
}: {
  node: FlowNode;
  isSelected: boolean;
  isConnecting: boolean;
  onClick: () => void;
  onConnectStart: (nodeId: string) => void;
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
      onClick={(e) => {
        e.stopPropagation();
        if (isConnecting) {
          onConnectStart(node.id);
        } else {
          onClick();
        }
      }}
      className={cn(
        "absolute w-44 glass-card p-3 cursor-pointer transition-all duration-200 group",
        isSelected && "ring-2 ring-blue-400/60 shadow-lg shadow-blue-400/10",
        isDragging && "opacity-70 scale-105 z-50",
        isConnecting && "ring-2 ring-emerald-400/60 cursor-crosshair"
      )}
      style={{ left: node.position.x, top: node.position.y }}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeInfo.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-200 truncate flex-1">{node.name}</span>
      </div>
      {node.approverIds.length > 0 && (
        <p className="text-xs text-slate-500 mt-1.5 pl-10">{node.approverIds.length} 位审批人</p>
      )}
      {isConnecting && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
          <Link className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
}

function ConnectionLines({
  nodes,
  edges,
  selectedEdgeId,
  onEdgeClick,
  tempLine,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedEdgeId: string | null;
  onEdgeClick: (edgeId: string) => void;
  tempLine?: { x1: number; y1: number; x2: number; y2: number } | null;
}) {
  const getNodeCenter = (node: FlowNode) => ({
    x: node.position.x + 88,
    y: node.position.y + 24,
  });

  return (
    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#64748B" />
        </marker>
        <marker id="arrowhead-selected" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#3B82F6" />
        </marker>
      </defs>
      {edges.map((edge) => {
        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return null;
        const sx = source.position.x + 176;
        const sy = source.position.y + 24;
        const tx = target.position.x;
        const ty = target.position.y + 24;
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;
        const isSelected = selectedEdgeId === edge.id;

        return (
          <g key={edge.id}>
            <line
              x1={sx}
              y1={sy}
              x2={tx}
              y2={ty}
              stroke={isSelected ? "#3B82F6" : "#475569"}
              strokeWidth={isSelected ? 3 : 2}
              markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdgeClick(edge.id);
              }}
            />
            {edge.label && (
              <g>
                <rect
                  x={midX - 30}
                  y={midY - 10}
                  width={60}
                  height={20}
                  rx={4}
                  fill="#1E293B"
                  stroke={isSelected ? "#3B82F6" : "#475569"}
                  strokeWidth={1}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isSelected ? "#93C5FD" : "#94A3B8"}
                  fontSize={11}
                  className="pointer-events-none select-none"
                >
                  {edge.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {tempLine && (
        <line
          x1={tempLine.x1}
          y1={tempLine.y1}
          x2={tempLine.x2}
          y2={tempLine.y2}
          stroke="#10B981"
          strokeWidth={2}
          strokeDasharray="6 3"
          markerEnd="url(#arrowhead)"
        />
      )}
    </svg>
  );
}

export default function ApprovalDesigner() {
  const [flow, setFlow] = useState<ApprovalFlow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const [tempLine, setTempLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const canvasRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = "approval-flow-draft";

  const loadFlow = useCallback(async () => {
    try {
      const res = await fetch("/api/approval-flows");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        const f = json.data[0];
        setFlow(f);
        setNodes(f.nodes || []);
        setEdges(f.edges || []);
        setSaveStatus("saved");
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          setNodes(draft.nodes || []);
          setEdges(draft.edges || []);
        }
      }
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setNodes(draft.nodes || []);
        setEdges(draft.edges || []);
      }
    }
  }, []);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
      setSaveStatus("unsaved");
    }
  }, [nodes, edges]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const addNode = useCallback(
    (type: FlowNode["type"]) => {
      const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const typeInfo = nodeTypes.find((t) => t.type === type);
      const newNode: FlowNode = {
        id,
        type,
        name: typeInfo?.label || type,
        approverIds: [],
        position: { x: 100 + Math.random() * 300, y: 80 + Math.random() * 200 },
      };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(id);
      setSelectedEdgeId(null);
    },
    []
  );

  const updateNode = useCallback((id: string, updates: Partial<FlowNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedNodeId) {
      setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
      setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
    if (selectedEdgeId) {
      setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId]);

  const handleCanvasClick = useCallback(() => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectFromId(null);
      setTempLine(null);
    } else {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [isConnecting]);

  const handleConnectStart = useCallback(
    (nodeId: string) => {
      if (!isConnecting) {
        setIsConnecting(true);
        setConnectFromId(nodeId);
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          setTempLine({
            x1: node.position.x + 176,
            y1: node.position.y + 24,
            x2: node.position.x + 176 + 50,
            y2: node.position.y + 24,
          });
        }
      } else if (connectFromId && connectFromId !== nodeId) {
        const existingEdge = edges.find(
          (e) => e.source === connectFromId && e.target === nodeId
        );
        if (!existingEdge) {
          const newEdge: FlowEdge = {
            id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            source: connectFromId,
            target: nodeId,
            label: "",
          };
          setEdges((prev) => [...prev, newEdge]);
          setSelectedEdgeId(newEdge.id);
        }
        setIsConnecting(false);
        setConnectFromId(null);
        setTempLine(null);
      } else {
        setIsConnecting(false);
        setConnectFromId(null);
        setTempLine(null);
      }
    },
    [isConnecting, connectFromId, nodes, edges]
  );

  const handleEdgeClick = useCallback(
    (edgeId: string) => {
      setSelectedEdgeId(edgeId);
      setSelectedNodeId(null);
    },
    []
  );

  const startEditLabel = useCallback(() => {
    if (selectedEdgeId) {
      const edge = edges.find((e) => e.id === selectedEdgeId);
      setEditLabel(edge?.label || "");
      setEditingEdgeId(selectedEdgeId);
    }
  }, [selectedEdgeId, edges]);

  const saveLabel = useCallback(() => {
    if (editingEdgeId) {
      setEdges((prev) =>
        prev.map((e) => (e.id === editingEdgeId ? { ...e, label: editLabel } : e))
      );
      setEditingEdgeId(null);
    }
  }, [editingEdgeId, editLabel]);

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
    setSaveStatus("saving");
    try {
      if (flow) {
        const res = await fetch(`/api/approval-flows/${flow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });
        if (res.ok) {
          setSaveStatus("saved");
        }
      } else {
        const res = await fetch("/api/approval-flows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "默认审批流程", nodes, edges }),
        });
        const json = await res.json();
        if (json.success) {
          setFlow(json.data);
          setSaveStatus("saved");
        }
      }
    } catch {
      setSaveStatus("unsaved");
    }
  };

  const handleClear = () => {
    if (confirm("确定要清空画布吗？所有节点和连线都将被删除。")) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const { setNodeRef: setCanvasDropRef } = useDroppable({ id: "canvas" });

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-7rem)] gap-4 animate-fade-in">
        <div className="w-52 glass-card p-4 flex flex-col gap-3 shrink-0">
          <h3 className="text-sm font-medium text-slate-300 mb-1">节点面板</h3>
          {nodeTypes.map((nt) => (
            <PaletteItem key={nt.type} {...nt} />
          ))}

          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
            <button
              onClick={() => {
                setIsConnecting(!isConnecting);
                setConnectFromId(null);
                setTempLine(null);
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                isConnecting
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                  : "bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50"
              )}
            >
              <Link className="w-4 h-4" />
              {isConnecting ? "取消连线" : "添加连线"}
            </button>
            <button
              onClick={deleteSelected}
              disabled={!selectedNodeId && !selectedEdgeId}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800/50 text-red-400 border border-slate-700/50 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="w-4 h-4" />
              删除选中
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div
            ref={(el) => {
              setCanvasDropRef(el);
              (canvasRef as any).current = el;
            }}
            onClick={handleCanvasClick}
            className="flex-1 glass-card relative overflow-auto scrollbar-thin"
            style={{ cursor: isConnecting ? "crosshair" : "default" }}
          >
            <ConnectionLines
              nodes={nodes}
              edges={edges}
              selectedEdgeId={selectedEdgeId}
              onEdgeClick={handleEdgeClick}
              tempLine={tempLine}
            />
            {nodes.map((node) => (
              <CanvasNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isConnecting={isConnecting}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                }}
                onConnectStart={handleConnectStart}
              />
            ))}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <GitBranch className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">拖拽左侧节点到画布开始设计</p>
                  <p className="text-slate-600 text-xs mt-1">
                    {isConnecting ? "点击节点开始连线，再点击另一节点完成连线" : "点击「添加连线」按钮开始连接节点"}
                  </p>
                </div>
              </div>
            )}

            {isConnecting && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-xs z-10">
                连线模式：点击起始节点 → 点击目标节点
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                disabled={saveStatus === "saving"}
              >
                <Save className="w-4 h-4" />
                {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? "已保存" : "保存"}
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <TestTube2 className="w-4 h-4" />
                测试
              </button>
              <button
                onClick={handleClear}
                className="btn-secondary flex items-center gap-2 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  saveStatus === "saved"
                    ? "bg-emerald-400"
                    : saveStatus === "saving"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-slate-500"
                )}
              />
              <span className="text-slate-500">
                {saveStatus === "saved"
                  ? "已保存"
                  : saveStatus === "saving"
                  ? "保存中..."
                  : "有未保存的更改"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-64 glass-card p-4 shrink-0 overflow-y-auto scrollbar-thin">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">节点属性</h3>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-slate-500 hover:text-slate-300"
                >
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
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      type: e.target.value as FlowNode["type"],
                    })
                  }
                  className="input-dark"
                >
                  {nodeTypes.map((nt) => (
                    <option key={nt.type} value={nt.type}>
                      {nt.label}
                    </option>
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
                  <p className="text-xs text-slate-600 mt-1">
                    提示：在连线上设置分支名称
                  </p>
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
              <button
                onClick={deleteSelected}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-400/20 hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                删除节点
              </button>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">连线属性</h3>
                <button
                  onClick={() => setSelectedEdgeId(null)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">分支名称</label>
                {editingEdgeId === selectedEdgeId ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="input-dark flex-1"
                      placeholder="例如：同意"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveLabel();
                        if (e.key === "Escape") setEditingEdgeId(null);
                      }}
                    />
                    <button
                      onClick={saveLabel}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm border border-emerald-400/30"
                    >
                      确定
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={startEditLabel}
                    className="input-dark cursor-pointer flex items-center justify-between group"
                  >
                    <span className={selectedEdge.label ? "text-slate-200" : "text-slate-500"}>
                      {selectedEdge.label || "点击设置分支名称"}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <span className="text-slate-500">起始节点：</span>
                  {nodes.find((n) => n.id === selectedEdge.source)?.name || "-"}
                </p>
                <p>
                  <span className="text-slate-500">目标节点：</span>
                  {nodes.find((n) => n.id === selectedEdge.target)?.name || "-"}
                </p>
              </div>
              <button
                onClick={deleteSelected}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-400/20 hover:bg-red-500/20 transition-all"
              >
                <Unlink className="w-4 h-4" />
                删除连线
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <GitBranch className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">点击画布中的节点或连线</p>
              <p className="text-xs text-slate-600 mt-1">查看和编辑属性</p>
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
