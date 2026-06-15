import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Globe,
  LogOut,
  User,
  Building2,
  Shield,
  Workflow,
  GanttChart,
} from "lucide-react";
import { useAppStore } from "@/store";

const navItems = [
  { path: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { path: "/tasks", icon: Kanban, labelKey: "nav.tasks" },
  { path: "/approvals", icon: CheckSquare, labelKey: "nav.approvals" },
  { path: "/performance", icon: BarChart3, labelKey: "nav.performance" },
  { path: "/messages", icon: MessageSquare, labelKey: "nav.messages" },
  {
    path: "/admin",
    icon: Settings,
    labelKey: "nav.admin",
    children: [
      { path: "/admin/org", icon: Building2, labelKey: "nav.orgManagement" },
      { path: "/admin/roles", icon: Shield, labelKey: "nav.roleManagement" },
    ],
  },
];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, language, setLanguage, notifications, currentUser } =
    useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isAdminActive = location.pathname.startsWith("/admin");

  const handleLanguageSwitch = () => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      <aside
        className={`flex flex-col h-full bg-navy-50 border-r border-slate-700/50
          transition-all duration-300 ease-in-out relative
          ${sidebarCollapsed ? "w-16" : "w-60"}`}
      >
        <div className="flex items-center h-16 px-4 border-b border-slate-700/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-cyan-blue flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-slate-100">
                TaskFlow
              </span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-cyan-blue flex items-center justify-center mx-auto">
              <Workflow className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.children ? isAdminActive : isActive(item.path);

            return (
              <div key={item.path}>
                <NavLink
                  to={item.children ? item.children[0].path : item.path}
                  className={`sidebar-item mb-1 ${active ? "active" : ""}`}
                  title={sidebarCollapsed ? t(item.labelKey) : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm truncate">{t(item.labelKey)}</span>
                  )}
                  {!sidebarCollapsed && active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-glow" />
                  )}
                </NavLink>

                {item.children && active && !sidebarCollapsed && (
                  <div className="ml-7 mt-1 space-y-1 animate-fade-in">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = location.pathname === child.path;
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                            transition-all duration-200 cursor-pointer
                            ${childActive
                              ? "text-emerald bg-emerald/10"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
                            }`}
                        >
                          <ChildIcon className="w-4 h-4 flex-shrink-0" />
                          <span>{t(child.labelKey)}</span>
                        </NavLink>
                      );
                    })}
                    <NavLink
                      to="/approvals/designer"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                        transition-all duration-200 cursor-pointer
                        ${location.pathname === "/approvals/designer"
                          ? "text-emerald bg-emerald/10"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
                        }`}
                    >
                      <GanttChart className="w-4 h-4 flex-shrink-0" />
                      <span>{t("nav.approvalDesigner")}</span>
                    </NavLink>
                  </div>
                )}

                {item.children && isAdminActive && sidebarCollapsed && (
                  <div className="space-y-1 mt-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = location.pathname === child.path;
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={`sidebar-item mb-1 pl-5 ${childActive ? "active" : ""}`}
                          title={t(child.labelKey)}
                        >
                          <ChildIcon className="w-4 h-4 flex-shrink-0" />
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full
            bg-slate-700 border border-slate-600/50
            flex items-center justify-center
            hover:bg-slate-600 transition-colors duration-200 z-10"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
          )}
        </button>

        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-700/50">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-cyan-blue flex items-center justify-center text-xs font-bold text-white">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser.department}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 glass-strong flex items-center justify-between px-6 border-b border-slate-700/50 z-20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={t("common.search") + "..."}
                className="input-dark pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLanguageSwitch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-slate-400 hover:text-slate-200 hover:bg-slate-700/40
                transition-all duration-200"
              title={t("common.language")}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{language === "zh" ? "中" : "EN"}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg
                  text-slate-400 hover:text-slate-200 hover:bg-slate-700/40
                  transition-all duration-200"
                title={t("common.notifications")}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                    rounded-full bg-red-500 text-white text-[10px] font-bold
                    flex items-center justify-center animate-pulse-glow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 glass-strong rounded-xl
                  border border-slate-700/50 shadow-2xl animate-slide-in overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                    <span className="text-sm font-medium text-slate-200">
                      {t("common.notifications")}
                    </span>
                    <button className="text-xs text-emerald hover:text-emerald-400 transition-colors">
                      {t("message.markAllRead")}
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-slate-700/30
                          hover:bg-slate-700/20 transition-colors cursor-pointer
                          ${!notification.read ? "bg-slate-700/10" : ""}`}
                        onClick={() => useAppStore.getState().markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-emerald mt-1.5 flex-shrink-0" />
                          )}
                          <div className={!notification.read ? "" : "ml-4"}>
                            <p className="text-sm text-slate-200">{notification.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{notification.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-700/50 mx-1" />

            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                  hover:bg-slate-700/40 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-cyan-blue
                  flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.name.charAt(0)}
                </div>
                {sidebarCollapsed && (
                  <span className="text-sm text-slate-300">{currentUser.name}</span>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 glass-strong rounded-xl
                  border border-slate-700/50 shadow-2xl animate-slide-in overflow-hidden py-1">
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5
                    text-sm text-slate-300 hover:bg-slate-700/40 transition-colors">
                    <User className="w-4 h-4" />
                    {t("common.profile")}
                  </button>
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5
                    text-sm text-slate-300 hover:bg-slate-700/40 transition-colors">
                    <Settings className="w-4 h-4" />
                    {t("common.settings")}
                  </button>
                  <div className="my-1 border-t border-slate-700/50" />
                  <button className="flex items-center gap-2.5 w-full px-4 py-2.5
                    text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    {t("common.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
