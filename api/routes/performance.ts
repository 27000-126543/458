import { Router, type Request, type Response } from 'express'
import {
  users,
  departments,
  performanceRecords,
  tasks,
} from '../db/mockData.js'

const router = Router()

router.get('/report', (req: Request, res: Response): void => {
  const { departmentId, period } = req.query

  let targetUsers = [...users]

  if (departmentId) {
    targetUsers = targetUsers.filter(u => u.departmentId === departmentId)
  }

  const periodFilter = period || '2025-Q1'

  const report = targetUsers.map(user => {
    const records = performanceRecords.filter(r => r.userId === user.id)
    const currentRecord = records.find(r => r.period === periodFilter)
    const userTasks = tasks.filter(t => t.assigneeId === user.id)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: departments.find(d => d.id === user.departmentId)?.name || '',
        performanceScore: user.performanceScore,
        loadPercentage: user.loadPercentage,
        status: user.status,
      },
      performance: currentRecord || null,
      taskStats: {
        total: userTasks.length,
        completed: userTasks.filter(t => t.status === 'completed').length,
        inProgress: userTasks.filter(t => t.status === 'in_progress').length,
        overdue: userTasks.filter(t =>
          t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.dueDate) < new Date()
        ).length,
      },
    }
  })

  report.sort((a, b) => (b.performance?.totalScore || b.user.performanceScore) - (a.performance?.totalScore || a.user.performanceScore))

  res.json({ success: true, data: report, total: report.length })
})

router.get('/trend', (req: Request, res: Response): void => {
  const { userId, departmentId } = req.query

  let targetRecords = [...performanceRecords]

  if (userId) {
    targetRecords = targetRecords.filter(r => r.userId === userId)
  } else if (departmentId) {
    const deptUsers = users.filter(u => u.departmentId === departmentId)
    const deptUserIds = new Set(deptUsers.map(u => u.id))
    targetRecords = targetRecords.filter(r => deptUserIds.has(r.userId))
  }

  const periods = [...new Set(targetRecords.map(r => r.period))].sort()

  const trend = periods.map(period => {
    const periodRecords = targetRecords.filter(r => r.period === period)
    const avgCompletion = periodRecords.length > 0
      ? Math.round(periodRecords.reduce((s, r) => s + r.taskCompletionRate, 0) / periodRecords.length)
      : 0
    const avgOnTime = periodRecords.length > 0
      ? Math.round(periodRecords.reduce((s, r) => s + r.onTimeRate, 0) / periodRecords.length)
      : 0
    const avgQuality = periodRecords.length > 0
      ? Math.round(periodRecords.reduce((s, r) => s + r.qualityScore, 0) / periodRecords.length)
      : 0
    const avgCollaboration = periodRecords.length > 0
      ? Math.round(periodRecords.reduce((s, r) => s + r.collaborationScore, 0) / periodRecords.length)
      : 0
    const avgTotal = periodRecords.length > 0
      ? Math.round(periodRecords.reduce((s, r) => s + r.totalScore, 0) / periodRecords.length)
      : 0

    return {
      period,
      avgCompletion,
      avgOnTime,
      avgQuality,
      avgCollaboration,
      avgTotal,
      count: periodRecords.length,
    }
  })

  const userTrends: Record<string, typeof trend> = {}

  if (userId) {
    const user = users.find(u => u.id === userId)
    userTrends[userId as string] = trend
    res.json({
      success: true,
      data: {
        user: user ? { id: user.id, name: user.name } : null,
        trend,
      },
    })
    return
  }

  const groupKey = departmentId || 'all'

  res.json({
    success: true,
    data: {
      department: departmentId ? departments.find(d => d.id === departmentId)?.name || null : '全部',
      trend,
    },
  })
})

export default router
