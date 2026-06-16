import { v4 as uuidv4 } from 'uuid'

export interface Department {
  id: string
  name: string
  headId: string
  memberCount: number
  description: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
  level: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  departmentId: string
  roleId: string
  skills: string[]
  loadPercentage: number
  performanceScore: number
  status: 'online' | 'offline' | 'busy'
  joinDate: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'planning'
  managerId: string
  departmentId: string
  startDate: string
  endDate: string
  progress: number
  priority: 'high' | 'medium' | 'low'
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskSource = 'manual' | 'approval' | 'system' | 'import'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  source: TaskSource
  projectId: string
  assigneeId: string | null
  creatorId: string
  departmentId: string
  startDate: string
  dueDate: string
  completedDate: string | null
  estimatedHours: number
  actualHours: number | null
  tags: string[]
  dependencies: string[]
  approvalInstanceId: string | null
  createdAt: string
  updatedAt: string
}

export interface ApprovalFlowNode {
  id: string
  type: 'start' | 'approval' | 'cc' | 'condition' | 'end'
  name: string
  approverIds: string[]
  position: { x: number; y: number }
}

export interface ApprovalFlowEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ApprovalFlow {
  id: string
  name: string
  description: string
  nodes: ApprovalFlowNode[]
  edges: ApprovalFlowEdge[]
  createdAt: string
  updatedAt: string
}

export type ApprovalInstanceStatus = 'pending' | 'approved' | 'rejected' | 'transferred' | 'cancelled'

export interface ApprovalInstance {
  id: string
  flowId: string
  title: string
  description: string
  taskId: string | null
  status: ApprovalInstanceStatus
  currentStep: number
  initiatorId: string
  currentNodeId: string
  createdAt: string
  updatedAt: string
}

export interface ApprovalAction {
  id: string
  instanceId: string
  nodeId: string
  userId: string
  action: 'approve' | 'reject' | 'transfer' | 'submit'
  comment: string
  transferToUserId?: string
  createdAt: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  taskId: string
  userId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'task_assigned' | 'task_updated' | 'approval_required' | 'approval_result' | 'comment_added' | 'mention' | 'deadline_approaching'
  title: string
  content: string
  relatedId: string | null
  relatedType: 'task' | 'approval' | 'project' | null
  read: boolean
  createdAt: string
}

export interface PerformanceRecord {
  id: string
  userId: string
  period: string
  taskCompletionRate: number
  onTimeRate: number
  qualityScore: number
  collaborationScore: number
  totalScore: number
  createdAt: string
}

const did1 = uuidv4()
const did2 = uuidv4()
const did3 = uuidv4()
const did4 = uuidv4()
const did5 = uuidv4()

const rid1 = uuidv4()
const rid2 = uuidv4()
const rid3 = uuidv4()
const rid4 = uuidv4()
const rid5 = uuidv4()

const uid1 = uuidv4()
const uid2 = uuidv4()
const uid3 = uuidv4()
const uid4 = uuidv4()
const uid5 = uuidv4()
const uid6 = uuidv4()
const uid7 = uuidv4()
const uid8 = uuidv4()
const uid9 = uuidv4()
const uid10 = uuidv4()
const uid11 = uuidv4()
const uid12 = uuidv4()
const uid13 = uuidv4()
const uid14 = uuidv4()
const uid15 = uuidv4()
const uid16 = uuidv4()

const pid1 = uuidv4()
const pid2 = uuidv4()
const pid3 = uuidv4()
const pid4 = uuidv4()
const pid5 = uuidv4()
const pid6 = uuidv4()

const tid1 = uuidv4()
const tid2 = uuidv4()
const tid3 = uuidv4()
const tid4 = uuidv4()
const tid5 = uuidv4()
const tid6 = uuidv4()
const tid7 = uuidv4()
const tid8 = uuidv4()
const tid9 = uuidv4()
const tid10 = uuidv4()
const tid11 = uuidv4()
const tid12 = uuidv4()
const tid13 = uuidv4()
const tid14 = uuidv4()
const tid15 = uuidv4()
const tid16 = uuidv4()
const tid17 = uuidv4()
const tid18 = uuidv4()
const tid19 = uuidv4()
const tid20 = uuidv4()
const tid21 = uuidv4()
const tid22 = uuidv4()
const tid23 = uuidv4()
const tid24 = uuidv4()
const tid25 = uuidv4()

const afid1 = uuidv4()
const afid2 = uuidv4()

const afn1 = uuidv4()
const afn2 = uuidv4()
const afn3 = uuidv4()
const afn4 = uuidv4()
const afn5 = uuidv4()
const afn6 = uuidv4()

const afe1 = uuidv4()
const afe2 = uuidv4()
const afe3 = uuidv4()
const afe4 = uuidv4()
const afe5 = uuidv4()

const ains1 = uuidv4()
const ains2 = uuidv4()
const ains3 = uuidv4()
const ains4 = uuidv4()
const ains5 = uuidv4()
const ains6 = uuidv4()

export const departments: Department[] = [
  { id: did1, name: '技术研发部', headId: uid2, memberCount: 6, description: '负责核心产品技术研发与架构设计' },
  { id: did2, name: '市场营销部', headId: uid6, memberCount: 4, description: '负责品牌推广、市场拓展与客户关系维护' },
  { id: did3, name: '产品设计部', headId: uid8, memberCount: 3, description: '负责产品规划、用户体验设计与交互优化' },
  { id: did4, name: '运营管理部', headId: uid11, memberCount: 3, description: '负责日常运营、流程优化与资源协调' },
  { id: did5, name: '人力资源部', headId: uid14, memberCount: 3, description: '负责人才招聘、培训发展与绩效管理' },
]

export const roles: Role[] = [
  { id: rid1, name: '系统管理员', permissions: ['all'], level: 1 },
  { id: rid2, name: '部门管理者', permissions: ['department_manage', 'task_assign', 'approval_approve', 'performance_view'], level: 2 },
  { id: rid3, name: '项目经理', permissions: ['project_manage', 'task_create', 'task_assign', 'approval_submit'], level: 3 },
  { id: rid4, name: '执行人员', permissions: ['task_execute', 'comment_add', 'attachment_upload'], level: 4 },
  { id: rid5, name: '审批人员', permissions: ['approval_approve', 'approval_reject', 'approval_transfer'], level: 3 },
]

export const users: User[] = [
  { id: uid1, name: '赵建国', email: 'zhao.jianguo@company.com', avatar: '', departmentId: did1, roleId: rid1, skills: ['系统架构', 'DevOps', '技术管理'], loadPercentage: 85, performanceScore: 92, status: 'online', joinDate: '2021-03-15' },
  { id: uid2, name: '李明辉', email: 'li.minghui@company.com', avatar: '', departmentId: did1, roleId: rid2, skills: ['后端开发', '系统架构', '团队管理'], loadPercentage: 90, performanceScore: 88, status: 'busy', joinDate: '2020-07-01' },
  { id: uid3, name: '王思远', email: 'wang.siyuan@company.com', avatar: '', departmentId: did1, roleId: rid3, skills: ['前端开发', 'React', 'TypeScript'], loadPercentage: 75, performanceScore: 91, status: 'online', joinDate: '2022-01-10' },
  { id: uid4, name: '陈晓峰', email: 'chen.xiaofeng@company.com', avatar: '', departmentId: did1, roleId: rid4, skills: ['后端开发', 'Node.js', '数据库'], loadPercentage: 60, performanceScore: 85, status: 'online', joinDate: '2022-06-20' },
  { id: uid5, name: '刘雨欣', email: 'liu.yuxin@company.com', avatar: '', departmentId: did1, roleId: rid4, skills: ['前端开发', 'Vue', 'UI开发'], loadPercentage: 70, performanceScore: 87, status: 'offline', joinDate: '2023-02-14' },
  { id: uid6, name: '张伟强', email: 'zhang.weiqiang@company.com', avatar: '', departmentId: did2, roleId: rid2, skills: ['市场策略', '品牌管理', '团队管理'], loadPercentage: 80, performanceScore: 84, status: 'online', joinDate: '2020-11-05' },
  { id: uid7, name: '黄丽娜', email: 'huang.lina@company.com', avatar: '', departmentId: did2, roleId: rid4, skills: ['内容营销', '社交媒体', '文案策划'], loadPercentage: 55, performanceScore: 90, status: 'online', joinDate: '2022-09-01' },
  { id: uid8, name: '吴志远', email: 'wu.zhiyuan@company.com', avatar: '', departmentId: did3, roleId: rid2, skills: ['产品规划', '用户研究', '团队管理'], loadPercentage: 88, performanceScore: 93, status: 'busy', joinDate: '2020-05-18' },
  { id: uid9, name: '孙雅琪', email: 'sun.yaqi@company.com', avatar: '', departmentId: did3, roleId: rid4, skills: ['UI设计', 'Figma', '设计系统'], loadPercentage: 65, performanceScore: 89, status: 'online', joinDate: '2022-04-01' },
  { id: uid10, name: '周浩然', email: 'zhou.haoran@company.com', avatar: '', departmentId: did3, roleId: rid5, skills: ['交互设计', '原型设计', '可用性测试'], loadPercentage: 50, performanceScore: 86, status: 'offline', joinDate: '2023-01-15' },
  { id: uid11, name: '郑凯文', email: 'zheng.kaiwen@company.com', avatar: '', departmentId: did4, roleId: rid2, skills: ['运营管理', '流程优化', '团队管理'], loadPercentage: 78, performanceScore: 82, status: 'online', joinDate: '2021-08-10' },
  { id: uid12, name: '马秀英', email: 'ma.xiuying@company.com', avatar: '', departmentId: did4, roleId: rid4, skills: ['数据分析', '报表制作', '流程管理'], loadPercentage: 45, performanceScore: 88, status: 'online', joinDate: '2022-11-20' },
  { id: uid13, name: '林子涵', email: 'lin.zihan@company.com', avatar: '', departmentId: did2, roleId: rid4, skills: ['市场调研', '竞品分析', '数据挖掘'], loadPercentage: 40, performanceScore: 83, status: 'online', joinDate: '2023-05-01' },
  { id: uid14, name: '何建华', email: 'he.jianhua@company.com', avatar: '', departmentId: did5, roleId: rid2, skills: ['人才发展', '绩效管理', '组织设计'], loadPercentage: 72, performanceScore: 80, status: 'online', joinDate: '2021-01-20' },
  { id: uid15, name: '杨美玲', email: 'yang.meiling@company.com', avatar: '', departmentId: did5, roleId: rid5, skills: ['招聘管理', '员工关系', '培训发展'], loadPercentage: 58, performanceScore: 85, status: 'online', joinDate: '2022-03-10' },
  { id: uid16, name: '徐鹏飞', email: 'xu.pengfei@company.com', avatar: '', departmentId: did1, roleId: rid5, skills: ['后端开发', '微服务', '代码审查'], loadPercentage: 35, performanceScore: 81, status: 'online', joinDate: '2023-08-15' },
]

export const projects: Project[] = [
  { id: pid1, name: '企业协作平台V3.0', description: '全新一代企业任务协作平台升级，支持智能推荐与审批流', status: 'active', managerId: uid2, departmentId: did1, startDate: '2025-01-15', endDate: '2025-09-30', progress: 65, priority: 'high' },
  { id: pid2, name: '移动端市场推广计划', description: 'Q2-Q3移动端用户增长与品牌推广策略执行', status: 'active', managerId: uid6, departmentId: did2, startDate: '2025-04-01', endDate: '2025-08-31', progress: 40, priority: 'medium' },
  { id: pid3, name: '产品设计系统2.0', description: '统一设计语言与组件库升级，覆盖全产品线', status: 'active', managerId: uid8, departmentId: did3, startDate: '2025-02-01', endDate: '2025-07-31', progress: 55, priority: 'high' },
  { id: pid4, name: '运营流程自动化', description: '内部运营流程数字化与自动化改造项目', status: 'planning', managerId: uid11, departmentId: did4, startDate: '2025-07-01', endDate: '2025-12-31', progress: 10, priority: 'medium' },
  { id: pid5, name: '人才发展体系建设', description: '建立完整的员工培训、晋升与绩效发展体系', status: 'active', managerId: uid14, departmentId: did5, startDate: '2025-03-01', endDate: '2025-10-31', progress: 30, priority: 'low' },
  { id: pid6, name: '智能推荐引擎', description: '基于技能与绩效的智能任务推荐系统', status: 'active', managerId: uid2, departmentId: did1, startDate: '2025-05-01', endDate: '2025-11-30', progress: 25, priority: 'high' },
]

export const tasks: Task[] = [
  { id: tid1, title: '用户认证模块重构', description: '将现有JWT认证升级为OAuth2.0+JWT双模式，支持SSO', status: 'in_progress', priority: 'high', source: 'manual', projectId: pid1, assigneeId: uid4, creatorId: uid2, departmentId: did1, startDate: '2025-05-01', dueDate: '2025-06-15', completedDate: null, estimatedHours: 80, actualHours: 45, tags: ['后端', '安全', '重构'], dependencies: [], approvalInstanceId: null, createdAt: '2025-04-25T08:00:00Z', updatedAt: '2025-06-10T14:30:00Z' },
  { id: tid2, title: '任务看板前端组件开发', description: '实现可拖拽的看板视图，支持任务状态流转与筛选', status: 'in_progress', priority: 'high', source: 'manual', projectId: pid1, assigneeId: uid3, creatorId: uid2, departmentId: did1, startDate: '2025-05-10', dueDate: '2025-06-20', completedDate: null, estimatedHours: 120, actualHours: 70, tags: ['前端', 'React', '组件开发'], dependencies: [], approvalInstanceId: null, createdAt: '2025-05-05T09:00:00Z', updatedAt: '2025-06-12T16:00:00Z' },
  { id: tid3, title: '审批流程引擎设计', description: '设计支持多节点、条件分支的审批流程引擎架构', status: 'in_progress', priority: 'urgent', source: 'manual', projectId: pid1, assigneeId: uid2, creatorId: uid1, departmentId: did1, startDate: '2025-04-15', dueDate: '2025-06-10', completedDate: null, estimatedHours: 160, actualHours: 130, tags: ['架构', '后端', '流程引擎'], dependencies: [], approvalInstanceId: ains1, createdAt: '2025-04-10T10:00:00Z', updatedAt: '2025-06-09T11:00:00Z' },
  { id: tid4, title: '移动端推广素材制作', description: '制作Q2移动端推广所需的全部视觉素材与文案', status: 'in_progress', priority: 'medium', source: 'manual', projectId: pid2, assigneeId: uid7, creatorId: uid6, departmentId: did2, startDate: '2025-05-15', dueDate: '2025-06-30', completedDate: null, estimatedHours: 60, actualHours: 35, tags: ['设计', '文案', '推广'], dependencies: [], approvalInstanceId: null, createdAt: '2025-05-10T08:30:00Z', updatedAt: '2025-06-11T09:00:00Z' },
  { id: tid5, title: '设计系统色板与字体规范', description: '制定统一色彩体系与字体规范，输出设计Token', status: 'completed', priority: 'high', source: 'manual', projectId: pid3, assigneeId: uid9, creatorId: uid8, departmentId: did3, startDate: '2025-02-01', dueDate: '2025-03-15', completedDate: '2025-03-10', estimatedHours: 40, actualHours: 38, tags: ['设计系统', '规范'], dependencies: [], approvalInstanceId: null, createdAt: '2025-01-28T10:00:00Z', updatedAt: '2025-03-10T16:00:00Z' },
  { id: tid6, title: '组件库基础组件开发', description: '开发Button、Input、Modal等20个基础UI组件', status: 'in_progress', priority: 'high', source: 'manual', projectId: pid3, assigneeId: uid5, creatorId: uid8, departmentId: did3, startDate: '2025-03-20', dueDate: '2025-07-15', completedDate: null, estimatedHours: 200, actualHours: 110, tags: ['前端', '组件库', 'React'], dependencies: [tid5], approvalInstanceId: null, createdAt: '2025-03-15T09:00:00Z', updatedAt: '2025-06-13T10:00:00Z' },
  { id: tid7, title: '竞品分析报告撰写', description: '分析Top5竞品功能与市场策略，输出分析报告', status: 'completed', priority: 'medium', source: 'manual', projectId: pid2, assigneeId: uid13, creatorId: uid6, departmentId: did2, startDate: '2025-04-10', dueDate: '2025-05-10', completedDate: '2025-05-08', estimatedHours: 50, actualHours: 48, tags: ['市场', '竞品分析'], dependencies: [], approvalInstanceId: null, createdAt: '2025-04-05T08:00:00Z', updatedAt: '2025-05-08T14:00:00Z' },
  { id: tid8, title: '运营数据看板需求分析', description: '梳理运营团队数据看板需求，输出PRD文档', status: 'completed', priority: 'medium', source: 'approval', projectId: pid4, assigneeId: uid12, creatorId: uid11, departmentId: did4, startDate: '2025-05-01', dueDate: '2025-05-31', completedDate: '2025-05-28', estimatedHours: 40, actualHours: 42, tags: ['需求', '运营', '数据'], dependencies: [], approvalInstanceId: ains3, createdAt: '2025-04-25T10:00:00Z', updatedAt: '2025-05-28T15:00:00Z' },
  { id: tid9, title: 'WebSocket实时推送模块', description: '实现任务状态变更、审批通知等实时推送功能', status: 'pending', priority: 'high', source: 'system', projectId: pid1, assigneeId: uid4, creatorId: uid2, departmentId: did1, startDate: '2025-06-20', dueDate: '2025-07-30', completedDate: null, estimatedHours: 60, actualHours: null, tags: ['后端', 'WebSocket', '实时'], dependencies: [tid1], approvalInstanceId: null, createdAt: '2025-06-01T09:00:00Z', updatedAt: '2025-06-01T09:00:00Z' },
  { id: tid10, title: '培训课程内容开发', description: '开发新员工入职培训与技能提升课程内容', status: 'in_progress', priority: 'medium', source: 'manual', projectId: pid5, assigneeId: uid15, creatorId: uid14, departmentId: did5, startDate: '2025-05-15', dueDate: '2025-07-15', completedDate: null, estimatedHours: 80, actualHours: 30, tags: ['培训', 'HR', '内容'], dependencies: [], approvalInstanceId: null, createdAt: '2025-05-10T08:00:00Z', updatedAt: '2025-06-12T11:00:00Z' },
  { id: tid11, title: '智能推荐算法原型', description: '实现基于技能匹配与负载均衡的任务推荐算法原型', status: 'in_progress', priority: 'urgent', source: 'manual', projectId: pid6, assigneeId: uid16, creatorId: uid2, departmentId: did1, startDate: '2025-05-20', dueDate: '2025-07-20', completedDate: null, estimatedHours: 100, actualHours: 40, tags: ['算法', '推荐', '后端'], dependencies: [], approvalInstanceId: ains2, createdAt: '2025-05-15T10:00:00Z', updatedAt: '2025-06-13T15:00:00Z' },
  { id: tid12, title: '绩效考核指标体系设计', description: '设计多维度绩效考核指标与评分标准', status: 'completed', priority: 'high', source: 'approval', projectId: pid5, assigneeId: uid14, creatorId: uid14, departmentId: did5, startDate: '2025-03-15', dueDate: '2025-04-30', completedDate: '2025-04-25', estimatedHours: 60, actualHours: 55, tags: ['绩效', 'HR', '制度'], dependencies: [], approvalInstanceId: ains4, createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-04-25T16:00:00Z' },
  { id: tid13, title: '用户反馈系统搭建', description: '搭建用户反馈收集、分类与跟踪系统', status: 'pending', priority: 'medium', source: 'import', projectId: pid1, assigneeId: null, creatorId: uid8, departmentId: did3, startDate: '2025-07-01', dueDate: '2025-08-31', completedDate: null, estimatedHours: 80, actualHours: null, tags: ['产品', '反馈', '系统'], dependencies: [tid2, tid6], approvalInstanceId: null, createdAt: '2025-06-05T10:00:00Z', updatedAt: '2025-06-05T10:00:00Z' },
  { id: tid14, title: '微服务网关升级', description: '升级API网关以支持新服务路由与限流策略', status: 'blocked', priority: 'high', source: 'system', projectId: pid1, assigneeId: uid4, creatorId: uid1, departmentId: did1, startDate: '2025-06-01', dueDate: '2025-07-15', completedDate: null, estimatedHours: 60, actualHours: 10, tags: ['后端', '微服务', '网关'], dependencies: [tid1], approvalInstanceId: null, createdAt: '2025-05-28T08:00:00Z', updatedAt: '2025-06-08T09:00:00Z' },
  { id: tid15, title: '社交媒体内容排期管理', description: '搭建社交媒体内容日历与自动发布系统', status: 'pending', priority: 'low', source: 'manual', projectId: pid2, assigneeId: uid7, creatorId: uid6, departmentId: did2, startDate: '2025-07-01', dueDate: '2025-08-15', completedDate: null, estimatedHours: 40, actualHours: null, tags: ['营销', '自动化', '内容'], dependencies: [tid4], approvalInstanceId: null, createdAt: '2025-06-10T09:00:00Z', updatedAt: '2025-06-10T09:00:00Z' },
  { id: tid16, title: '数据大屏可视化开发', description: '开发运营数据实时大屏，支持多维度数据展示', status: 'pending', priority: 'medium', source: 'approval', projectId: pid4, assigneeId: uid5, creatorId: uid11, departmentId: did4, startDate: '2025-07-15', dueDate: '2025-09-30', completedDate: null, estimatedHours: 100, actualHours: null, tags: ['前端', '可视化', '数据'], dependencies: [tid8], approvalInstanceId: ains5, createdAt: '2025-06-08T10:00:00Z', updatedAt: '2025-06-08T10:00:00Z' },
  { id: tid17, title: '权限管理系统重构', description: '重构RBAC权限模型，支持细粒度权限控制', status: 'in_progress', priority: 'high', source: 'manual', projectId: pid1, assigneeId: uid16, creatorId: uid1, departmentId: did1, startDate: '2025-05-25', dueDate: '2025-07-10', completedDate: null, estimatedHours: 90, actualHours: 50, tags: ['后端', '安全', '权限'], dependencies: [tid1], approvalInstanceId: null, createdAt: '2025-05-20T08:00:00Z', updatedAt: '2025-06-13T14:00:00Z' },
  { id: tid18, title: '招聘流程优化', description: '优化招聘流程，缩短招聘周期至30天以内', status: 'in_progress', priority: 'medium', source: 'manual', projectId: pid5, assigneeId: uid15, creatorId: uid14, departmentId: did5, startDate: '2025-04-20', dueDate: '2025-06-30', completedDate: null, estimatedHours: 60, actualHours: 35, tags: ['HR', '招聘', '流程'], dependencies: [], approvalInstanceId: null, createdAt: '2025-04-15T09:00:00Z', updatedAt: '2025-06-11T10:00:00Z' },
  { id: tid19, title: 'API文档自动生成', description: '接入Swagger自动生成API文档，支持在线调试', status: 'completed', priority: 'low', source: 'system', projectId: pid1, assigneeId: uid4, creatorId: uid2, departmentId: did1, startDate: '2025-04-01', dueDate: '2025-04-30', completedDate: '2025-04-28', estimatedHours: 30, actualHours: 28, tags: ['文档', 'API', '工具'], dependencies: [], approvalInstanceId: null, createdAt: '2025-03-28T08:00:00Z', updatedAt: '2025-04-28T15:00:00Z' },
  { id: tid20, title: '客户满意度调研执行', description: '执行Q2客户满意度调研，收集并分析反馈数据', status: 'in_progress', priority: 'medium', source: 'manual', projectId: pid2, assigneeId: uid13, creatorId: uid6, departmentId: did2, startDate: '2025-06-01', dueDate: '2025-07-15', completedDate: null, estimatedHours: 50, actualHours: 20, tags: ['市场', '调研', '数据'], dependencies: [tid7], approvalInstanceId: null, createdAt: '2025-05-28T08:00:00Z', updatedAt: '2025-06-12T09:00:00Z' },
  { id: tid21, title: '自动化测试框架搭建', description: '搭建前后端自动化测试框架，集成CI/CD流水线', status: 'pending', priority: 'high', source: 'system', projectId: pid1, assigneeId: null, creatorId: uid1, departmentId: did1, startDate: '2025-07-01', dueDate: '2025-08-31', completedDate: null, estimatedHours: 100, actualHours: null, tags: ['测试', 'CI/CD', '自动化'], dependencies: [tid1, tid17], approvalInstanceId: null, createdAt: '2025-06-05T10:00:00Z', updatedAt: '2025-06-05T10:00:00Z' },
  { id: tid22, title: '设计系统动效规范', description: '制定统一的动效规范与过渡动画标准', status: 'pending', priority: 'medium', source: 'manual', projectId: pid3, assigneeId: uid10, creatorId: uid8, departmentId: did3, startDate: '2025-07-01', dueDate: '2025-08-15', completedDate: null, estimatedHours: 40, actualHours: null, tags: ['设计', '动效', '规范'], dependencies: [tid5], approvalInstanceId: null, createdAt: '2025-06-08T09:00:00Z', updatedAt: '2025-06-08T09:00:00Z' },
  { id: tid23, title: '流程自动化RPA工具选型', description: '调研与评估主流RPA工具，输出选型报告', status: 'pending', priority: 'low', source: 'approval', projectId: pid4, assigneeId: uid12, creatorId: uid11, departmentId: did4, startDate: '2025-07-15', dueDate: '2025-08-31', completedDate: null, estimatedHours: 30, actualHours: null, tags: ['RPA', '工具', '调研'], dependencies: [], approvalInstanceId: null, createdAt: '2025-06-10T08:00:00Z', updatedAt: '2025-06-10T08:00:00Z' },
  { id: tid24, title: '跨部门协作流程梳理', description: '梳理并优化跨部门任务协作的流程与规范', status: 'in_progress', priority: 'medium', source: 'manual', projectId: pid4, assigneeId: uid11, creatorId: uid11, departmentId: did4, startDate: '2025-05-20', dueDate: '2025-07-20', completedDate: null, estimatedHours: 50, actualHours: 25, tags: ['流程', '协作', '规范'], dependencies: [], approvalInstanceId: ains6, createdAt: '2025-05-15T10:00:00Z', updatedAt: '2025-06-10T11:00:00Z' },
  { id: tid25, title: '数据库性能优化', description: '分析慢查询，优化索引与查询语句，提升数据库性能', status: 'completed', priority: 'urgent', source: 'system', projectId: pid1, assigneeId: uid4, creatorId: uid2, departmentId: did1, startDate: '2025-03-01', dueDate: '2025-03-31', completedDate: '2025-03-28', estimatedHours: 40, actualHours: 36, tags: ['数据库', '性能', '优化'], dependencies: [], approvalInstanceId: null, createdAt: '2025-02-28T08:00:00Z', updatedAt: '2025-03-28T16:00:00Z' },
]

export const approvalFlows: ApprovalFlow[] = [
  {
    id: afid1,
    name: '任务审批流程',
    description: '标准任务创建与执行审批流程',
    nodes: [
      { id: afn1, type: 'start', name: '发起申请', approverIds: [], position: { x: 100, y: 200 } },
      { id: afn2, type: 'approval', name: '项目经理审批', approverIds: [uid3, uid2], position: { x: 300, y: 200 } },
      { id: afn3, type: 'approval', name: '部门管理者审批', approverIds: [uid2, uid6], position: { x: 500, y: 200 } },
      { id: afn4, type: 'cc', name: '抄送运营管理部', approverIds: [uid11], position: { x: 500, y: 350 } },
      { id: afn5, type: 'end', name: '流程结束', approverIds: [], position: { x: 700, y: 200 } },
    ],
    edges: [
      { id: afe1, source: afn1, target: afn2 },
      { id: afe2, source: afn2, target: afn3 },
      { id: afe3, source: afn3, target: afn4 },
      { id: afe4, source: afn3, target: afn5 },
      { id: afe5, source: afn4, target: afn5 },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-05-15T10:00:00Z',
  },
  {
    id: afid2,
    name: '项目立项审批流程',
    description: '新项目立项与资源分配审批流程',
    nodes: [
      { id: afn6, type: 'start', name: '提交立项', approverIds: [], position: { x: 100, y: 200 } },
      { id: afn1 + '_n2', type: 'approval', name: '部门管理者审批', approverIds: [uid2, uid6, uid8], position: { x: 300, y: 200 } },
      { id: afn1 + '_n3', type: 'approval', name: '系统管理员审批', approverIds: [uid1], position: { x: 500, y: 200 } },
      { id: afn1 + '_n4', type: 'end', name: '审批完成', approverIds: [], position: { x: 700, y: 200 } },
    ],
    edges: [
      { id: afid2 + '_e1', source: afn6, target: afn1 + '_n2' },
      { id: afid2 + '_e2', source: afn1 + '_n2', target: afn1 + '_n3' },
      { id: afid2 + '_e3', source: afn1 + '_n3', target: afn1 + '_n4' },
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-04-20T09:00:00Z',
  },
]

export const approvalInstances: ApprovalInstance[] = [
  { id: ains1, flowId: afid1, title: '审批流程引擎设计审批', description: '审批流程引擎架构设计方案审批', taskId: tid3, status: 'pending', currentStep: 2, initiatorId: uid1, currentNodeId: afn3, createdAt: '2025-04-10T10:00:00Z', updatedAt: '2025-06-09T11:00:00Z' },
  { id: ains2, flowId: afid1, title: '智能推荐算法原型审批', description: '智能推荐算法开发任务审批', taskId: tid11, status: 'approved', currentStep: 3, initiatorId: uid2, currentNodeId: afn5, createdAt: '2025-05-15T10:00:00Z', updatedAt: '2025-06-01T14:00:00Z' },
  { id: ains3, flowId: afid1, title: '运营数据看板需求审批', description: '运营数据看板需求分析任务审批', taskId: tid8, status: 'approved', currentStep: 3, initiatorId: uid11, currentNodeId: afn5, createdAt: '2025-04-25T10:00:00Z', updatedAt: '2025-05-05T16:00:00Z' },
  { id: ains4, flowId: afid2, title: '绩效考核指标体系立项审批', description: '绩效考核指标体系设计项目立项审批', taskId: tid12, status: 'approved', currentStep: 3, initiatorId: uid14, currentNodeId: afn1 + '_n4', createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-03-20T11:00:00Z' },
  { id: ains5, flowId: afid1, title: '数据大屏可视化开发审批', description: '数据大屏可视化开发任务审批', taskId: tid16, status: 'pending', currentStep: 1, initiatorId: uid11, currentNodeId: afn2, createdAt: '2025-06-08T10:00:00Z', updatedAt: '2025-06-08T10:00:00Z' },
  { id: ains6, flowId: afid1, title: '跨部门协作流程梳理审批', description: '跨部门协作流程梳理与优化任务审批', taskId: tid24, status: 'rejected', currentStep: 2, initiatorId: uid11, currentNodeId: afn3, createdAt: '2025-05-15T10:00:00Z', updatedAt: '2025-05-25T09:00:00Z' },
]

export const approvalActions: ApprovalAction[] = [
  { id: uuidv4(), instanceId: ains2, nodeId: afn2, userId: uid3, action: 'approve', comment: '方案合理，同意推进', createdAt: '2025-05-20T10:00:00Z' },
  { id: uuidv4(), instanceId: ains2, nodeId: afn3, userId: uid2, action: 'approve', comment: '同意，注意控制开发周期', createdAt: '2025-05-25T14:00:00Z' },
  { id: uuidv4(), instanceId: ains3, nodeId: afn2, userId: uid2, action: 'approve', comment: '需求清晰，可以开始', createdAt: '2025-04-28T09:00:00Z' },
  { id: uuidv4(), instanceId: ains3, nodeId: afn3, userId: uid6, action: 'approve', comment: '同意，注意与市场数据对接', createdAt: '2025-05-02T11:00:00Z' },
  { id: uuidv4(), instanceId: ains4, nodeId: afn1 + '_n2', userId: uid8, action: 'approve', comment: '指标体系设计合理', createdAt: '2025-03-15T10:00:00Z' },
  { id: uuidv4(), instanceId: ains4, nodeId: afn1 + '_n3', userId: uid1, action: 'approve', comment: '批准立项', createdAt: '2025-03-18T14:00:00Z' },
  { id: uuidv4(), instanceId: ains6, nodeId: afn2, userId: uid3, action: 'approve', comment: '流程梳理有必要', createdAt: '2025-05-18T09:00:00Z' },
  { id: uuidv4(), instanceId: ains6, nodeId: afn3, userId: uid2, action: 'reject', comment: '流程设计不够细致，需要补充具体操作步骤', createdAt: '2025-05-25T09:00:00Z' },
]

export const comments: Comment[] = [
  { id: uuidv4(), taskId: tid1, userId: uid2, content: '认证模块需要同时兼容旧系统的Token格式，确保平滑迁移', createdAt: '2025-05-15T09:00:00Z', updatedAt: '2025-05-15T09:00:00Z' },
  { id: uuidv4(), taskId: tid1, userId: uid4, content: '已经完成JWT部分，正在对接OAuth2.0，预计本周完成', createdAt: '2025-06-10T14:30:00Z', updatedAt: '2025-06-10T14:30:00Z' },
  { id: uuidv4(), taskId: tid2, userId: uid3, content: '看板拖拽使用dnd-kit实现，基础交互已完成', createdAt: '2025-06-08T16:00:00Z', updatedAt: '2025-06-08T16:00:00Z' },
  { id: uuidv4(), taskId: tid2, userId: uid8, content: '交互设计稿已更新，请查看最新版本', createdAt: '2025-06-09T10:00:00Z', updatedAt: '2025-06-09T10:00:00Z' },
  { id: uuidv4(), taskId: tid3, userId: uid2, content: '条件分支的逻辑需要再讨论，目前方案可能存在死循环风险', createdAt: '2025-06-05T11:00:00Z', updatedAt: '2025-06-05T11:00:00Z' },
  { id: uuidv4(), taskId: tid3, userId: uid1, content: '同意，建议增加超时自动流转机制', createdAt: '2025-06-06T08:30:00Z', updatedAt: '2025-06-06T08:30:00Z' },
  { id: uuidv4(), taskId: tid11, userId: uid16, content: '算法原型第一版已完成，技能匹配准确率达到78%', createdAt: '2025-06-12T15:00:00Z', updatedAt: '2025-06-12T15:00:00Z' },
  { id: uuidv4(), taskId: tid11, userId: uid2, content: '不错，下一步加入负载均衡权重因子', createdAt: '2025-06-13T10:00:00Z', updatedAt: '2025-06-13T10:00:00Z' },
  { id: uuidv4(), taskId: tid14, userId: uid4, content: '被认证模块重构阻塞，等tid1完成后才能推进', createdAt: '2025-06-08T09:00:00Z', updatedAt: '2025-06-08T09:00:00Z' },
  { id: uuidv4(), taskId: tid10, userId: uid15, content: '已收集各部门培训需求，正在整理课程大纲', createdAt: '2025-06-11T11:00:00Z', updatedAt: '2025-06-11T11:00:00Z' },
]

export const attachments: Attachment[] = [
  { id: uuidv4(), taskId: tid1, userId: uid4, fileName: 'OAuth2.0集成方案.pdf', fileUrl: '/files/oauth2-integration.pdf', fileSize: 2048576, fileType: 'pdf', createdAt: '2025-05-20T10:00:00Z' },
  { id: uuidv4(), taskId: tid2, userId: uid3, fileName: '看板交互设计稿.fig', fileUrl: '/files/kanban-design.fig', fileSize: 5242880, fileType: 'fig', createdAt: '2025-06-01T14:00:00Z' },
  { id: uuidv4(), taskId: tid3, userId: uid2, fileName: '审批流程架构图.drawio', fileUrl: '/files/approval-arch.drawio', fileSize: 153600, fileType: 'drawio', createdAt: '2025-04-20T09:00:00Z' },
  { id: uuidv4(), taskId: tid5, userId: uid9, fileName: '设计Token规范.xlsx', fileUrl: '/files/design-tokens.xlsx', fileSize: 512000, fileType: 'xlsx', createdAt: '2025-03-01T10:00:00Z' },
  { id: uuidv4(), taskId: tid7, userId: uid13, fileName: '竞品分析报告.docx', fileUrl: '/files/competitor-analysis.docx', fileSize: 3072000, fileType: 'docx', createdAt: '2025-05-08T14:00:00Z' },
  { id: uuidv4(), taskId: tid11, userId: uid16, fileName: '推荐算法原型.py', fileUrl: '/files/recommendation-algo.py', fileSize: 25600, fileType: 'py', createdAt: '2025-06-12T15:00:00Z' },
  { id: uuidv4(), taskId: tid12, userId: uid14, fileName: '绩效指标体系v2.pdf', fileUrl: '/files/kpi-system-v2.pdf', fileSize: 1024000, fileType: 'pdf', createdAt: '2025-04-25T16:00:00Z' },
]

export const notifications: Notification[] = [
  { id: uuidv4(), userId: uid4, type: 'task_assigned', title: '新任务分配', content: '您被分配了任务：用户认证模块重构', relatedId: tid1, relatedType: 'task', read: true, createdAt: '2025-04-25T08:00:00Z' },
  { id: uuidv4(), userId: uid3, type: 'task_assigned', title: '新任务分配', content: '您被分配了任务：任务看板前端组件开发', relatedId: tid2, relatedType: 'task', read: true, createdAt: '2025-05-05T09:00:00Z' },
  { id: uuidv4(), userId: uid3, type: 'approval_required', title: '审批待办', content: '智能推荐算法原型审批需要您的审批', relatedId: ains2, relatedType: 'approval', read: true, createdAt: '2025-05-15T10:00:00Z' },
  { id: uuidv4(), userId: uid2, type: 'approval_required', title: '审批待办', content: '审批流程引擎设计审批需要您的审批', relatedId: ains1, relatedType: 'approval', read: false, createdAt: '2025-06-09T11:00:00Z' },
  { id: uuidv4(), userId: uid11, type: 'approval_result', title: '审批结果', content: '跨部门协作流程梳理审批已被驳回', relatedId: ains6, relatedType: 'approval', read: true, createdAt: '2025-05-25T09:00:00Z' },
  { id: uuidv4(), userId: uid4, type: 'deadline_approaching', title: '截止日期临近', content: '任务"用户认证模块重构"将于3天后到期', relatedId: tid1, relatedType: 'task', read: false, createdAt: '2025-06-12T08:00:00Z' },
  { id: uuidv4(), userId: uid7, type: 'task_assigned', title: '新任务分配', content: '您被分配了任务：移动端推广素材制作', relatedId: tid4, relatedType: 'task', read: true, createdAt: '2025-05-10T08:30:00Z' },
  { id: uuidv4(), userId: uid2, type: 'comment_added', title: '新评论', content: '陈晓峰评论了任务"用户认证模块重构"', relatedId: tid1, relatedType: 'task', read: false, createdAt: '2025-06-10T14:30:00Z' },
  { id: uuidv4(), userId: uid6, type: 'approval_required', title: '审批待办', content: '数据大屏可视化开发审批需要您的审批', relatedId: ains5, relatedType: 'approval', read: false, createdAt: '2025-06-08T10:00:00Z' },
  { id: uuidv4(), userId: uid16, type: 'task_updated', title: '任务状态更新', content: '任务"权限管理系统重构"状态已更新为进行中', relatedId: tid17, relatedType: 'task', read: true, createdAt: '2025-05-25T08:00:00Z' },
  { id: uuidv4(), userId: uid11, type: 'approval_result', title: '审批结果', content: '运营数据看板需求审批已通过', relatedId: ains3, relatedType: 'approval', read: true, createdAt: '2025-05-05T16:00:00Z' },
  { id: uuidv4(), userId: uid14, type: 'approval_result', title: '审批结果', content: '绩效考核指标体系立项审批已通过', relatedId: ains4, relatedType: 'approval', read: true, createdAt: '2025-03-20T11:00:00Z' },
]

export const performanceRecords: PerformanceRecord[] = [
  { id: uuidv4(), userId: uid1, period: '2025-Q1', taskCompletionRate: 95, onTimeRate: 90, qualityScore: 92, collaborationScore: 88, totalScore: 91.5, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid2, period: '2025-Q1', taskCompletionRate: 90, onTimeRate: 85, qualityScore: 88, collaborationScore: 90, totalScore: 88.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid3, period: '2025-Q1', taskCompletionRate: 92, onTimeRate: 94, qualityScore: 90, collaborationScore: 88, totalScore: 91.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid4, period: '2025-Q1', taskCompletionRate: 85, onTimeRate: 82, qualityScore: 86, collaborationScore: 84, totalScore: 84.5, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid5, period: '2025-Q1', taskCompletionRate: 88, onTimeRate: 86, qualityScore: 89, collaborationScore: 85, totalScore: 87.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid6, period: '2025-Q1', taskCompletionRate: 82, onTimeRate: 80, qualityScore: 85, collaborationScore: 88, totalScore: 84.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid7, period: '2025-Q1', taskCompletionRate: 90, onTimeRate: 92, qualityScore: 88, collaborationScore: 90, totalScore: 90.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid8, period: '2025-Q1', taskCompletionRate: 94, onTimeRate: 92, qualityScore: 95, collaborationScore: 90, totalScore: 93.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid9, period: '2025-Q1', taskCompletionRate: 90, onTimeRate: 88, qualityScore: 92, collaborationScore: 85, totalScore: 89.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid10, period: '2025-Q1', taskCompletionRate: 84, onTimeRate: 86, qualityScore: 88, collaborationScore: 85, totalScore: 86.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid11, period: '2025-Q1', taskCompletionRate: 80, onTimeRate: 78, qualityScore: 84, collaborationScore: 86, totalScore: 82.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid12, period: '2025-Q1', taskCompletionRate: 88, onTimeRate: 90, qualityScore: 86, collaborationScore: 88, totalScore: 88.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid13, period: '2025-Q1', taskCompletionRate: 82, onTimeRate: 84, qualityScore: 80, collaborationScore: 86, totalScore: 83.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid14, period: '2025-Q1', taskCompletionRate: 78, onTimeRate: 80, qualityScore: 82, collaborationScore: 78, totalScore: 80.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid15, period: '2025-Q1', taskCompletionRate: 86, onTimeRate: 84, qualityScore: 85, collaborationScore: 86, totalScore: 85.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid16, period: '2025-Q1', taskCompletionRate: 80, onTimeRate: 82, qualityScore: 80, collaborationScore: 82, totalScore: 81.0, createdAt: '2025-04-01T00:00:00Z' },
  { id: uuidv4(), userId: uid1, period: '2024-Q4', taskCompletionRate: 93, onTimeRate: 88, qualityScore: 90, collaborationScore: 86, totalScore: 89.5, createdAt: '2025-01-01T00:00:00Z' },
  { id: uuidv4(), userId: uid2, period: '2024-Q4', taskCompletionRate: 88, onTimeRate: 82, qualityScore: 86, collaborationScore: 88, totalScore: 86.0, createdAt: '2025-01-01T00:00:00Z' },
  { id: uuidv4(), userId: uid3, period: '2024-Q4', taskCompletionRate: 90, onTimeRate: 92, qualityScore: 88, collaborationScore: 86, totalScore: 89.0, createdAt: '2025-01-01T00:00:00Z' },
  { id: uuidv4(), userId: uid8, period: '2024-Q4', taskCompletionRate: 92, onTimeRate: 90, qualityScore: 93, collaborationScore: 88, totalScore: 91.0, createdAt: '2025-01-01T00:00:00Z' },
  { id: uuidv4(), userId: uid7, period: '2024-Q4', taskCompletionRate: 88, onTimeRate: 90, qualityScore: 86, collaborationScore: 88, totalScore: 88.0, createdAt: '2025-01-01T00:00:00Z' },
]

export function generateId(): string {
  return uuidv4()
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id)
}

export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find(t => t.id === id)
}

export function getRoleById(id: string): Role | undefined {
  return roles.find(r => r.id === id)
}
