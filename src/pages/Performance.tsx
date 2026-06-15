import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  BarChart3,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

interface ReportItem {
  user: {
    id: string;
    name: string;
    department: string;
    performanceScore: number;
  };
  performance: {
    taskCompletionRate: number;
    onTimeRate: number;
    qualityScore: number;
    collaborationScore: number;
    totalScore: number;
  } | null;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

interface TrendItem {
  period: string;
  avgCompletion: number;
  avgOnTime: number;
  avgQuality: number;
  avgCollaboration: number;
  avgTotal: number;
  count: number;
}

const departments = [
  { id: "", name: "全部部门" },
  { id: "dept_tech", name: "技术研发部" },
  { id: "dept_marketing", name: "市场营销部" },
  { id: "dept_product", name: "产品设计部" },
  { id: "dept_ops", name: "运营管理部" },
  { id: "dept_hr", name: "人力资源部" },
];

const periods = [
  { value: "monthly", label: "月度" },
  { value: "quarterly", label: "季度" },
  { value: "yearly", label: "年度" },
];

function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  trend?: number;
  icon: typeof TrendingUp;
  color: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-heading font-bold text-slate-100">{value}</p>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend >= 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function Performance() {
  const [report, setReport] = useState<ReportItem[]>([]);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptId, setDeptId] = useState("");
  const [period, setPeriod] = useState("quarterly");

  useEffect(() => {
    Promise.all([
      fetch(`/api/performance/report${deptId ? `?departmentId=${deptId}` : ""}`).then((r) => r.json()),
      fetch(`/api/performance/trend${deptId ? `?departmentId=${deptId}` : ""}`).then((r) => r.json()),
    ])
      .then(([reportJson, trendJson]) => {
        if (reportJson.success) setReport(reportJson.data);
        if (trendJson.success) setTrend(trendJson.data.trend);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [deptId]);

  const avgScore = report.length > 0
    ? Math.round(report.reduce((s, r) => s + (r.performance?.totalScore || r.user.performanceScore), 0) / report.length * 10) / 10
    : 0;

  const maxScore = report.length > 0
    ? Math.max(...report.map((r) => r.performance?.totalScore || r.user.performanceScore))
    : 0;

  const trendDelta = trend.length >= 2
    ? Math.round((trend[trend.length - 1].avgTotal - trend[trend.length - 2].avgTotal) * 10) / 10
    : 0;

  const deptChartData = departments.slice(1).map((dept) => {
    const deptReport = report.filter((r) => r.user.department === dept.name);
    const avg = deptReport.length > 0
      ? Math.round(deptReport.reduce((s, r) => s + (r.performance?.totalScore || r.user.performanceScore), 0) / deptReport.length)
      : 0;
    return { name: dept.name.replace("部", ""), 绩效分: avg };
  });

  const trendWithPrediction = (() => {
    if (trend.length === 0) return [];
    const last = trend[trend.length - 1];
    const prediction = [
      { period: "2025-Q2", avgTotal: Math.round(last.avgTotal * 1.02), isPredicted: true, upper: Math.round(last.avgTotal * 1.08), lower: Math.round(last.avgTotal * 0.96) },
      { period: "2025-Q3", avgTotal: Math.round(last.avgTotal * 1.05), isPredicted: true, upper: Math.round(last.avgTotal * 1.12), lower: Math.round(last.avgTotal * 0.98) },
      { period: "2025-Q4", avgTotal: Math.round(last.avgTotal * 1.07), isPredicted: true, upper: Math.round(last.avgTotal * 1.15), lower: Math.round(last.avgTotal * 1.0) },
    ];
    return [
      ...trend.map((t) => ({ ...t, isPredicted: false, upper: t.avgTotal, lower: t.avgTotal })),
      ...prediction,
    ];
  })();

  const top10 = report.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100">绩效分析</h1>
          <p className="text-sm text-slate-500 mt-1">团队绩效数据总览与趋势分析</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            className="input-dark w-40"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="flex glass rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  period === p.value
                    ? "bg-emerald/20 text-emerald"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="平均绩效分"
          value={avgScore}
          trend={trendDelta}
          icon={Target}
          color="text-cyan-400 bg-cyan-400/10"
        />
        <MetricCard
          label="最高绩效分"
          value={maxScore}
          icon={Trophy}
          color="text-emerald-400 bg-emerald-400/10"
        />
        <MetricCard
          label="绩效趋势"
          value={trendDelta >= 0 ? "上升" : "下降"}
          trend={trendDelta}
          icon={TrendingUp}
          color="text-amber-400 bg-amber-400/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">部门绩效对比</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} domain={[70, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(30,41,59,0.95)",
                  border: "1px solid rgba(148,163,184,0.1)",
                  borderRadius: 8,
                  color: "#E2E8F0",
                }}
              />
              <Bar dataKey="绩效分" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">绩效趋势与预测</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendWithPrediction}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} domain={[75, 100]} />
              <Tooltip
                contentStyle={{
                  background: "rgba(30,41,59,0.95)",
                  border: "1px solid rgba(148,163,184,0.1)",
                  borderRadius: 8,
                  color: "#E2E8F0",
                }}
              />
              <Area
                dataKey="upper"
                stroke="none"
                fill="rgba(16,185,129,0.08)"
                fillOpacity={1}
                name="置信上界"
              />
              <Area
                dataKey="lower"
                stroke="none"
                fill="rgba(15,23,42,1)"
                fillOpacity={1}
                name="置信下界"
              />
              <Line
                type="monotone"
                dataKey="avgTotal"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={{ fill: "#06B6D4", r: 3 }}
                name="历史数据"
              />
              <Line
                type="monotone"
                dataKey="avgTotal"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: "#10B981", r: 3, strokeDasharray: "" }}
                connectNulls={false}
                name="预测值"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          绩效排行榜 Top 10
        </h3>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">排名</th>
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">姓名</th>
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">部门</th>
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">综合分</th>
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">完成率</th>
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">按时率</th>
                <th className="text-left text-xs font-medium text-slate-500 py-3 px-3">质量分</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((item, idx) => {
                const score = item.performance?.totalScore || item.user.performanceScore;
                return (
                  <tr key={item.user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          idx === 0 && "bg-amber-400/20 text-amber-400",
                          idx === 1 && "bg-slate-400/20 text-slate-300",
                          idx === 2 && "bg-orange-400/20 text-orange-400",
                          idx > 2 && "text-slate-500"
                        )}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-slate-200">{item.user.name}</td>
                    <td className="py-3 px-3 text-sm text-slate-400">{item.user.department}</td>
                    <td className="py-3 px-3">
                      <span className="text-sm font-medium text-emerald-400">{score}</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-slate-400">{item.performance?.taskCompletionRate || "-"}%</td>
                    <td className="py-3 px-3 text-sm text-slate-400">{item.performance?.onTimeRate || "-"}%</td>
                    <td className="py-3 px-3 text-sm text-slate-400">{item.performance?.qualityScore || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
