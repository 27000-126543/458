import { create } from "zustand";

interface User {
  id: string;
  name: string;
  avatar: string;
  role: "admin" | "manager" | "member" | "guest";
  department: string;
  departmentId: string;
  email: string;
}

interface Notification {
  id: string;
  type: "task" | "approval" | "system" | "mention";
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface AppState {
  currentUser: User;
  sidebarCollapsed: boolean;
  language: "zh" | "en";
  notifications: Notification[];
  wsConnected: boolean;

  toggleSidebar: () => void;
  setLanguage: (lang: "zh" | "en") => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  setWsConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: {
    id: "u001",
    name: "张明远",
    avatar: "",
    role: "admin",
    department: "技术研发部",
    departmentId: "dept_tech",
    email: "zhangmy@company.com",
  },
  sidebarCollapsed: false,
  language: "zh",
  notifications: [
    {
      id: "n1",
      type: "task",
      title: "新任务指派",
      content: "「Q3产品规划方案」已指派给您",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "n2",
      type: "approval",
      title: "审批提醒",
      content: "「服务器采购申请」等待您的审批",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "n3",
      type: "system",
      title: "系统通知",
      content: "系统将于今晚22:00进行维护升级",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  wsConnected: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setLanguage: (lang) => set({ language: lang }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `n_${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
