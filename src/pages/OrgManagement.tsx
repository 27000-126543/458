import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Search,
  UserPlus,
  Settings,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  headId: string;
  memberCount: number;
  description: string;
  parentId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  departmentId: string;
  roleId: string;
  skills: string[];
  loadPercentage: number;
  performanceScore: number;
  status: "online" | "offline" | "busy";
}

export default function OrgManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
    ]).then(() => {
      setDepartments([
        { id: "dept1", name: "技术研发部", headId: "u1", memberCount: 8, description: "负责产品研发与技术创新", parentId: undefined },
        { id: "dept1-1", name: "前端开发组", headId: "u2", memberCount: 3, description: "Web及移动端前端开发", parentId: "dept1" },
        { id: "dept1-2", name: "后端开发组", headId: "u3", memberCount: 3, description: "服务端架构与业务逻辑", parentId: "dept1" },
        { id: "dept1-3", name: "测试质量组", headId: "u4", memberCount: 2, description: "质量保障与自动化测试", parentId: "dept1" },
        { id: "dept2", name: "产品设计部", headId: "u5", memberCount: 4, description: "产品规划与交互设计", parentId: undefined },
        { id: "dept3", name: "市场营销部", headId: "u6", memberCount: 5, description: "品牌推广与市场运营", parentId: undefined },
        { id: "dept4", name: "运营管理部", headId: "u7", memberCount: 3, description: "日常运营与数据分析", parentId: undefined },
        { id: "dept5", name: "人力资源部", headId: "u8", memberCount: 2, description: "人事管理与组织发展", parentId: undefined },
      ]);
      setUsers([
        { id: "u1", name: "张伟", email: "zhangwei@company.com", avatar: "", departmentId: "dept1", roleId: "r1", skills: ["架构设计", "项目管理"], loadPercentage: 78, performanceScore: 92, status: "online" },
        { id: "u2", name: "李娜", email: "lina@company.com", avatar: "", departmentId: "dept1-1", roleId: "r2", skills: ["React", "TypeScript", "Vue"], loadPercentage: 85, performanceScore: 88, status: "busy" },
        { id: "u3", name: "王磊", email: "wanglei@company.com", avatar: "", departmentId: "dept1-2", roleId: "r2", skills: ["Node.js", "Java", "MySQL"], loadPercentage: 60, performanceScore: 95, status: "online" },
        { id: "u4", name: "刘芳", email: "liufang@company.com", avatar: "", departmentId: "dept1-3", roleId: "r2", skills: ["测试设计", "自动化", "性能测试"], loadPercentage: 45, performanceScore: 82, status: "online" },
        { id: "u5", name: "陈静", email: "chenjing@company.com", avatar: "", departmentId: "dept2", roleId: "r1", skills: ["产品设计", "用户研究"], loadPercentage: 72, performanceScore: 90, status: "online" },
        { id: "u6", name: "赵强", email: "zhaoqiang@company.com", avatar: "", departmentId: "dept3", roleId: "r1", skills: ["市场营销", "品牌策划"], loadPercentage: 65, performanceScore: 86, status: "offline" },
        { id: "u7", name: "孙敏", email: "sunmin@company.com", avatar: "", departmentId: "dept4", roleId: "r1", skills: ["运营管理", "数据分析"], loadPercentage: 55, performanceScore: 89, status: "online" },
        { id: "u8", name: "周杰", email: "zhoujie@company.com", avatar: "", departmentId: "dept5", roleId: "r1", skills: ["人力资源", "组织发展"], loadPercentage: 40, performanceScore: 85, status: "online" },
        { id: "u9", name: "吴鹏", email: "wupeng@company.com", avatar: "", departmentId: "dept1-1", roleId: "r3", skills: ["React", "TypeScript"], loadPercentage: 90, performanceScore: 78, status: "busy" },
        { id: "u10", name: "郑婷", email: "zhengting@company.com", avatar: "", departmentId: "dept1-2", roleId: "r3", skills: ["Java", "Spring"], loadPercentage: 75, performanceScore: 84, status: "online" },
        { id: "u11", name: "马超", email: "machao@company.com", avatar: "", departmentId: "dept2", roleId: "r2", skills: ["UI设计", "交互设计"], loadPercentage: 68, performanceScore: 91, status: "online" },
        { id: "u12", name: "黄丽", email: "huangli@company.com", avatar: "", departmentId: "dept3", roleId: "r2", skills: ["内容营销", "SEO"], loadPercentage: 50, performanceScore: 87, status: "offline" },
        { id: "u13", name: "林浩", email: "linhao@company.com", avatar: "", departmentId: "dept1-1", roleId: "r3", skills: ["Vue", "小程序"], loadPercentage: 58, performanceScore: 80, status: "online" },
        { id: "u14", name: "徐莹", email: "xuying@company.com", avatar: "", departmentId: "dept4", roleId: "r2", skills: ["数据分析", "Excel"], loadPercentage: 52, performanceScore: 83, status: "online" },
        { id: "u15", name: "何建", email: "hejian@company.com", avatar: "", departmentId: "dept1-3", roleId: "r3", skills: ["功能测试", "接口测试"], loadPercentage: 42, performanceScore: 79, status: "online" },
        { id: "u16", name: "朱琳", email: "zhulin@company.com", avatar: "", departmentId: "dept5", roleId: "r2", skills: ["招聘", "培训"], loadPercentage: 38, performanceScore: 81, status: "online" },
      ]);
      setLoading(false);
    });
  }, []);

  const toggleDept = (deptId: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const rootDepartments = departments.filter((d) => !d.parentId);
  const childDepartments = (parentId: string) =>
    departments.filter((d) => d.parentId === parentId);

  const filteredUsers = users.filter(
    (u) =>
      (selectedDept ? u.departmentId === selectedDept || u.departmentId.startsWith(selectedDept) : true) &&
      (searchTerm
        ? u.name.includes(searchTerm) || u.email.includes(searchTerm)
        : true)
  );

  const statusColors: Record<string, string> = {
    online: "bg-emerald-400",
    offline: "bg-slate-500",
    busy: "bg-amber-400",
  };

  const renderDepartmentTree = (depts: Department[], level = 0) => {
    return depts.map((dept) => {
      const children = childDepartments(dept.id);
      const hasChildren = children.length > 0;
      const isExpanded = expandedDepts.has(dept.id);
      const isSelected = selectedDept === dept.id;

      return (
        <div key={dept.id}>
          <div
            onClick={() => {
              setSelectedDept(dept.id);
              if (hasChildren) toggleDept(dept.id);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
              isSelected
                ? "bg-emerald/15 text-emerald-400"
                : "text-slate-300 hover:bg-slate-700/40"
            )}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
              )
            ) : (
              <div className="w-4 shrink-0" />
            )}
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-sm font-medium truncate">
              {dept.name}
            </span>
            <span className="text-xs text-slate-500">{dept.memberCount}</span>
          </div>
          {hasChildren && isExpanded && (
            <div>{renderDepartmentTree(children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] grid grid-cols-12 gap-6 animate-fade-in">
      <div className="col-span-3 glass-card p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-heading text-slate-100">组织架构</h3>
          <button className="w-8 h-8 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {renderDepartmentTree(rootDepartments)}
        </div>
      </div>

      <div className="col-span-9 glass-card p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-100">
              {selectedDept
                ? departments.find((d) => d.id === selectedDept)?.name || "全部成员"
                : "全部成员"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              共 {filteredUsers.length} 人
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="搜索成员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-dark pl-9 w-64 text-sm"
              />
            </div>
            <button className="btn-primary flex items-center gap-2 text-sm">
              <UserPlus className="w-4 h-4" />
              添加成员
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                  <th className="pb-3 pl-4 font-medium">成员</th>
                  <th className="pb-3 font-medium">部门</th>
                  <th className="pb-3 font-medium">岗位</th>
                  <th className="pb-3 font-medium">状态</th>
                  <th className="pb-3 font-medium">工作负载</th>
                  <th className="pb-3 font-medium">绩效分</th>
                  <th className="pb-3 pr-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => {
                  const dept = departments.find((d) => d.id === user.departmentId);
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-gradient-cyan-blue flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0)}
                            </div>
                            <div
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-navy",
                                statusColors[user.status]
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-slate-400">
                        {dept?.name || "-"}
                      </td>
                      <td className="py-3 text-sm text-slate-400">
                        <span className="px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 text-xs">
                          {user.roleId === "r1"
                            ? "部门经理"
                            : user.roleId === "r2"
                            ? "主管"
                            : "工程师"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            user.status === "online"
                              ? "text-emerald-400"
                              : user.status === "busy"
                              ? "text-amber-400"
                              : "text-slate-500"
                          )}
                        >
                          {user.status === "online"
                            ? "在线"
                            : user.status === "busy"
                            ? "忙碌"
                            : "离线"}
                        </span>
                      </td>
                      <td className="py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                user.loadPercentage > 80
                                  ? "bg-red-500"
                                  : user.loadPercentage > 60
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              )}
                              style={{ width: `${user.loadPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">
                            {user.loadPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "text-sm font-semibold font-heading",
                            user.performanceScore >= 90
                              ? "text-emerald-400"
                              : user.performanceScore >= 80
                              ? "text-cyan-400"
                              : "text-amber-400"
                          )}
                        >
                          {user.performanceScore}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
