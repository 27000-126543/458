import { Router, type Request, type Response } from 'express'
import {
  tasks,
  users,
  projects,
  departments,
  notifications,
  approvalInstances,
} from '../db/mockData.js'

const router = Router()

router.get('/', (_req: Request, res: Response): void => {
  const heatmap = generateHeatmap()
  const capacityCards = generateCapacityCards()
  const kpiMetrics = generateKPIMetrics()
  const recentEvents = generateRecentEvents()

  res.json({
    success: true,
    data: {
      heatmap,
      capacityCards,
      kpiMetrics,
      recentEvents,
    },
  })
})

function generateHeatmap() {
  const days = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseIntensity = isWeekend ? 0.1 + Math.random() * 0.2 : 0.3 + Math.random() * 0.6
    const intensity = Math.min(baseIntensity + Math.sin(i * 0.3) * 0.15, 1)

    const total = Math.floor(intensity * 12)
    const completed = Math.floor(total * (0.3 + Math.random() * 0.3))
    const inProgress = Math.floor(total * (0.3 + Math.random() * 0.3))
    const pending = total - completed - inProgress

    days.push({
      date: dateStr,
      total,
      completed,
      inProgress,
      pending,
      intensity: Math.max(0, Math.min(1, intensity)),
    })
  }

  return days
}

function generateCapacityCards() {
  return departments.map(dept => {
    const deptUsers = users.filter(u => u.departmentId === dept.id)
    const deptTasks = tasks.filter(t => t.departmentId === dept.id)

    const totalLoad = deptUsers.reduce((sum, u) => sum + u.loadPercentage, 0)
    const avgLoad = deptUsers.length > 0 ? Math.round(totalLoad / deptUsers.length) : 0

    const activeTasks = deptTasks.filter(t => t.status === 'in_progress').length
    const pendingTasks = deptTasks.filter(t => t.status === 'pending').length
    const completedTasks = deptTasks.filter(t => t.status === 'completed').length

    const onlineCount = deptUsers.filter(u => u.status === 'online').length

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      memberCount: deptUsers.length,
      onlineCount,
      avgLoad,
      activeTasks,
      pendingTasks,
      completedTasks,
      loadStatus: avgLoad >= 80 ? 'overloaded' : avgLoad >= 60 ? 'balanced' : 'available',
    }
  })
}

function generateKPIMetrics() {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length

  const onTimeCompleted = Math.floor(completedTasks * 0.85)
  const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompleted / completedTasks) * 100) : 0

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const avgProgress = activeProjects > 0
    ? Math.round(projects.filter(p => p.status === 'active').reduce((sum, p) => sum + p.progress, 0) / activeProjects)
    : 0

  const pendingApprovals = approvalInstances.filter(a => a.status === 'pending').length

  const avgPerformanceScore = users.length > 0
    ? Math.round(users.reduce((sum, u) => sum + u.performanceScore, 0) / users.length)
    : 0

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    onTimeRate,
    totalProjects,
    activeProjects,
    avgProgress,
    pendingApprovals,
    avgPerformanceScore,
  }
}

function generateRecentEvents() {
  const now = new Date()
  const eventTypes = [
    { type: 'task_completed', icon: 'check', titleTpl: '完成了任务', suffix: '' },
    { type: 'task_assigned', icon: 'clipboard', titleTpl: '分配了新任务', suffix: '' },
    { type: 'approval_approved', icon: 'thumbs-up', titleTpl: '审批通过', suffix: '' },
    { type: 'approval_required', icon: 'clock', titleTpl: '待您审批', suffix: '' },
    { type: 'task_updated', icon: 'edit', titleTpl: '更新了任务', suffix: '' },
    { type: 'comment_added', icon: 'message', titleTpl: '发表了评论', suffix: '' },
  ]

  const events = []
  for (let i = 0; i < 15; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const randomUser = users[Math.floor(Math.random() * users.length)]
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
    const date = new Date(now.getTime() - i * (1000 * 60 * (5 + Math.random() * 25)))

    events.push({
      id: `evt-${i}`,
      type: eventType.type,
      title: `${randomUser.name} ${eventType.titleTpl}`,
      content: randomTask.title.substring(0, 30) + (randomTask.title.length > 30 ? '...' : ''),
      relatedId: randomTask.id,
      relatedType: 'task',
      createdAt: date.toISOString(),
      user: {
        id: randomUser.id,
        name: randomUser.name,
        avatar: randomUser.avatar,
      },
    })
  }

  return events.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10)
}

export default router
