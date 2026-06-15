import { useState } from "react";
import {
  Shield,
  Plus,
  Check,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Users,
  Settings,
  FileText,
  BarChart3,
  MessageSquare,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  userCount: number;
  permissions: string[];
  dataScope: "all" | "department" | "team" | "self";
}

interface PermissionCategory {
  key: string;
  label: string;
  icon: typeof Settings;
  permissions: { key: string; label: string }[];
}

const permissionCategories: PermissionCategory[] = [
  {
    key: "dashboard",
    label: "仪表盘",
    icon: BarChart3,
    permissions: [
      { key: "dashboard:view", label: "查看仪表盘" },
      { key: "dashboard:export", label: "导出报表" },
      { key: "dashboard:config", label: "配置布局" },
    ],
  },
  {
    key: "task",
    label: "任务管理",
    icon: FileText,
    permissions: [
      { key: "task:view", label: "查看任务" },
      { key: "task:create", label: "创建任务" },
      { key: "task:edit", label: "编辑任务" },
      { key: "task:delete", label: "删除任务" },
      { key: "task:assign", label: "分配任务" },
      { key: "task:recommend", label: "使用智能推荐" },
    ],
  },
  {
    key: "approval",
    label: "审批中心",
    icon: Shield,
    permissions: [
      { key: "approval:view", label: "查看审批" },
      { key: "approval:submit", label: "发起审批" },
      { key: "approval:approve", label: "审批操作" },
      { key: "approval:transfer", label: "转审" },
      { key: "approval:design", label: "配置流程" },
    ],
  },
  {
    key: "performance",
    label: "绩效分析",
    icon: BarChart3,
    permissions: [
      { key: "performance:view", label: "查看绩效" },
      { key: "performance:report", label: "生成报表" },
      { key: "performance:export", label: "导出数据" },
      { key: "performance:manage", label: "管理绩效" },
    ],
  },
  {
    key: "collaboration",
    label: "协作空间",
    icon: MessageSquare,
    permissions: [
      { key: "comment:create", label: "发表评论" },
      { key: "comment:delete", label: "删除评论" },
      { key: "attachment:upload", label: "上传附件" },
      { key: "attachment:download", label: "下载附件" },
    ],
  },
  {
    key: "system",
    label: "系统管理",
    icon: Settings,
    permissions: [
      { key: "org:view", label: "查看组织架构" },
      { key: "org:edit", label: "编辑组织架构" },
      { key: "role:view", label: "查看角色" },
      { key: "role:edit", label: "编辑角色" },
      { key: "user:manage", label: "用户管理" },
      { key: "system:config", label: "系统配置" },
    ],
  },
];

const dataScopeOptions = [
  { key: "all", label: "全部数据", icon: Globe, description: "可查看所有部门数据" },
  { key: "department", label: "本部门数据", icon: Building2, description: "仅可查看本部门数据" },
  { key: "team", label: "本团队数据", icon: Users, description: "仅可查看本团队数据" },
  { key: "self", label: "仅自己数据", icon: Eye, description: "仅可查看自己相关数据" },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "r1",
      name: "系统管理员",
      description: "拥有系统所有功能的最高权限",
      level: 1,
      userCount: 2,
      permissions: permissionCategories.flatMap((c) => c.permissions.map((p) => p.key)),
      dataScope: "all",
    },
    {
      id: "r2",
      name: "部门管理者",
      description: "部门资源调度、绩效审核、审批处理",
      level: 2,
      userCount: 5,
      permissions: [
        "dashboard:view",
        "dashboard:export",
        "task:view",
        "task:create",
        "task:edit",
        "task:assign",
        "task:recommend",
        "approval:view",
        "approval:submit",
        "approval:approve",
        "approval:transfer",
        "performance:view",
        "performance:report",
        "performance:export",
        "comment:create",
        "attachment:upload",
        "attachment:download",
        "org:view",
      ],
      dataScope: "department",
    },
    {
      id: "r3",
      name: "项目经理",
      description: "项目任务分配、甘特图管理、进度跟踪",
      level: 3,
      userCount: 8,
      permissions: [
        "dashboard:view",
        "task:view",
        "task:create",
        "task:edit",
        "task:assign",
        "task:recommend",
        "approval:view",
        "approval:submit",
        "performance:view",
        "comment:create",
        "attachment:upload",
        "attachment:download",
      ],
      dataScope: "team",
    },
    {
      id: "r4",
      name: "执行人员",
      description: "任务接收与执行、工时填报、评论协作",
      level: 4,
      userCount: 45,
      permissions: [
        "dashboard:view",
        "task:view",
        "comment:create",
        "attachment:download",
      ],
      dataScope: "self",
    },
    {
      id: "r5",
      name: "审批人员",
      description: "审批待办处理、转审、会签",
      level: 3,
      userCount: 12,
      permissions: [
        "approval:view",
        "approval:approve",
        "approval:transfer",
      ],
      dataScope: "department",
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<string | null>("r1");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(permissionCategories.map((c) => c.key))
  );

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const currentRole = roles.find((r) => r.id === selectedRole);

  const togglePermission = (permKey: string) => {
    if (!currentRole) return;
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole) return r;
        const hasPerm = r.permissions.includes(permKey);
        return {
          ...r,
          permissions: hasPerm
            ? r.permissions.filter((p) => p !== permKey)
            : [...r.permissions, permKey],
        };
      })
    );
  };

  const setDataScope = (scope: Role["dataScope"]) => {
    if (!currentRole) return;
    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole ? { ...r, dataScope: scope } : r))
    );
  };

  const toggleAllInCategory = (catKey: string, allPerms: string[]) => {
    if (!currentRole) return;
    const allSelected = allPerms.every((p) => currentRole.permissions.includes(p));

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole) return r;
        if (allSelected) {
          return {
            ...r,
            permissions: r.permissions.filter((p) => !allPerms.includes(p)),
          };
        } else {
          const newPerms = [...r.permissions];
          allPerms.forEach((p) => {
            if (!newPerms.includes(p)) newPerms.push(p);
          });
          return { ...r, permissions: newPerms };
        }
      })
    );
  };

  const levelColors: Record<number, string> = {
    1: "bg-red-500/20 text-red-400 border-red-500/30",
    2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    3: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    4: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="h-[calc(100vh-120px)] grid grid-cols-12 gap-6 animate-fade-in">
      <div className="col-span-3 glass-card p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-heading text-slate-100">角色列表</h3>
          <button className="w-8 h-8 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "p-4 rounded-xl cursor-pointer transition-all border",
                selectedRole === role.id
                  ? "bg-emerald/10 border-emerald/30"
                  : "bg-slate-800/20 border-slate-700/30 hover:border-slate-600/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield
                    className={cn(
                      "w-5 h-5",
                      selectedRole === role.id ? "text-emerald" : "text-slate-500"
                    )}
                  />
                  <span className="font-medium text-slate-200">{role.name}</span>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border",
                    levelColors[role.level]
                  )}
                >
                  Lv.{role.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{role.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {role.userCount}人
                </span>
                <span>{role.permissions.length}项权限</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-9 grid grid-rows-[auto,1fr] gap-6">
        {currentRole ? (
          <>
            <div className="glass-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold font-heading text-slate-100">
                      {currentRole.name}
                    </h2>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        levelColors[currentRole.level]
                      )}
                    >
                      Lv.{currentRole.level}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{currentRole.description}</p>
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{currentRole.userCount} 名成员</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Shield className="w-4 h-4" />
                      <span>{currentRole.permissions.length} 项权限</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary flex items-center gap-2 text-sm">
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 overflow-hidden">
              <div className="glass-card p-5 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold font-heading text-slate-100">
                    功能权限
                  </h3>
                  <span className="text-xs text-slate-500">
                    已选 {currentRole.permissions.length} 项
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
                  {permissionCategories.map((category) => {
                    const isExpanded = expandedCategories.has(category.key);
                    const allPerms = category.permissions.map((p) => p.key);
                    const selectedCount = allPerms.filter((p) =>
                      currentRole.permissions.includes(p)
                    ).length;
                    const allSelected = selectedCount === allPerms.length;
                    const Icon = category.icon;

                    return (
                      <div
                        key={category.key}
                        className="border border-slate-700/30 rounded-xl overflow-hidden"
                      >
                        <div
                          onClick={() => toggleCategory(category.key)}
                          className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 cursor-pointer hover:bg-slate-700/30 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <Icon className="w-4 h-4 text-cyan-400" />
                          <span className="flex-1 text-sm font-medium text-slate-200">
                            {category.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {selectedCount}/{allPerms.length}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllInCategory(category.key, allPerms);
                            }}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all",
                              allSelected
                                ? "bg-emerald border-emerald text-white"
                                : "border-slate-600 text-transparent hover:border-slate-500"
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="px-4 py-2 space-y-1">
                            {category.permissions.map((perm) => {
                              const isSelected =
                                currentRole.permissions.includes(perm.key);
                              return (
                                <div
                                  key={perm.key}
                                  onClick={() => togglePermission(perm.key)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-700/20 transition-colors"
                                >
                                  <button
                                    className={cn(
                                      "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                      isSelected
                                        ? "bg-emerald border-emerald text-white"
                                        : "border-slate-600 text-transparent hover:border-slate-500"
                                    )}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-sm text-slate-300">
                                    {perm.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold font-heading text-slate-100">
                    数据权限
                  </h3>
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  设置该角色可以查看的数据范围
                </p>
                <div className="space-y-3">
                  {dataScopeOptions.map((option) => {
                    const isSelected = currentRole.dataScope === option.key;
                    const Icon = option.icon;

                    return (
                      <div
                        key={option.key}
                        onClick={() => setDataScope(option.key as Role["dataScope"])}
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all border",
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/40"
                            : "bg-slate-800/20 border-slate-700/30 hover:border-slate-600/50"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-1.5">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              isSelected
                                ? "bg-cyan-500/20 text-cyan-400"
                                : "bg-slate-700/50 text-slate-400"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                isSelected ? "text-cyan-400" : "text-slate-200"
                              )}
                            >
                              {option.label}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              isSelected
                                ? "border-cyan-400"
                                : "border-slate-600"
                            )}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 ml-11">
                          {option.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-300 mb-1">
                        数据隔离提示
                      </p>
                      <p className="text-xs text-amber-200/70 leading-relaxed">
                        不同权限等级的用户将看到不同的数据范围。系统会自动根据用户角色过滤可访问的任务、审批和绩效数据。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/30">
                  <h4 className="text-sm font-medium text-slate-200 mb-3">
                    已分配成员
                  </h4>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-cyan-blue border-2 border-navy flex items-center justify-center text-xs text-white font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-navy flex items-center justify-center text-xs text-slate-400">
                      +{currentRole.userCount - 5}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center col-span-full">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">请选择一个角色进行配置</p>
          </div>
        )}
      </div>
    </div>
  );
}
