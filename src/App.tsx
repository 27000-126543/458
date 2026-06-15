import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/Dashboard";
import TaskBoardPage from "@/pages/TaskBoard";
import GanttChartPage from "@/pages/GanttChart";
import TaskDetailPage from "@/pages/TaskDetail";
import ApprovalListPage from "@/pages/ApprovalList";
import ApprovalDesignerPage from "@/pages/ApprovalDesigner";
import ApprovalDetailPage from "@/pages/ApprovalDetail";
import PerformancePage from "@/pages/Performance";
import MessagesPage from "@/pages/Messages";
import OrgManagementPage from "@/pages/OrgManagement";
import RoleManagementPage from "@/pages/RoleManagement";

function Login() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="glass-card p-8 w-96 animate-fade-in">
        <h1 className="text-2xl font-bold font-heading text-slate-100 text-center mb-6">
          TaskFlow
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          智能任务协同及资源调度中枢
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full btn-primary py-3"
        >
          进入系统
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TaskBoardPage />} />
          <Route path="/tasks/gantt" element={<GanttChartPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/approvals" element={<ApprovalListPage />} />
          <Route path="/approvals/designer" element={<ApprovalDesignerPage />} />
          <Route path="/approvals/:id" element={<ApprovalDetailPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/admin/org" element={<OrgManagementPage />} />
          <Route path="/admin/roles" element={<RoleManagementPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
