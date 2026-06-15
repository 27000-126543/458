import { Router, type Request, type Response } from 'express'
import {
  tasks,
  users,
  projects,
  departments,
  roles,
  generateId,
  type Task,
  type TaskStatus,
} from '../db/mockData.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  let result = [...tasks]

  const { status, assigneeId, projectId, priority, departmentId, search } = req.query

  if (status) {
    result = result.filter(t => t.status === status)
  }
  if (assigneeId) {
    result = result.filter(t => t.assigneeId === assigneeId)
  }
  if (projectId) {
    result = result.filter(t => t.projectId === projectId)
  }
  if (priority) {
    result = result.filter(t => t.priority === priority)
  }
  if (departmentId) {
    result = result.filter(t => t.departmentId === departmentId)
  }
  if (search) {
    const s = String(search).toLowerCase()
    result = result.filter(
      t =>
        t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.tags.some(tag => tag.toLowerCase().includes(s))
    )
  }

  const enriched = result.map(t => ({
    ...t,
    assignee: t.assigneeId ? users.find(u => u.id === t.assigneeId) || null : null,
    creator: users.find(u => u.id === t.creatorId) || null,
    project: projects.find(p => p.id === t.projectId) || null,
    department: departments.find(d => d.id === t.departmentId) || null,
  }))

  res.json({ success: true, data: enriched, total: enriched.length })
})

router.get('/:id', (req: Request, res: Response): void => {
  const task = tasks.find(t => t.id === req.params.id)
  if (!task) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const enriched = {
    ...task,
    assignee: task.assigneeId ? users.find(u => u.id === task.assigneeId) || null : null,
    creator: users.find(u => u.id === task.creatorId) || null,
    project: projects.find(p => p.id === task.projectId) || null,
    department: departments.find(d => d.id === task.departmentId) || null,
    dependencyTasks: task.dependencies
      .map(depId => {
        const dep = tasks.find(t => t.id === depId)
        return dep ? { id: dep.id, title: dep.title, status: dep.status } : null
      })
      .filter(Boolean),
  }

  res.json({ success: true, data: enriched })
})

router.post('/', (req: Request, res: Response): void => {
  const {
    title,
    description,
    priority,
    source,
    projectId,
    assigneeId,
    creatorId,
    departmentId,
    startDate,
    dueDate,
    estimatedHours,
    tags,
    dependencies,
  } = req.body

  if (!title || !projectId || !creatorId) {
    res.status(400).json({ success: false, error: '缺少必填字段: title, projectId, creatorId' })
    return
  }

  const now = new Date().toISOString()
  const newTask: Task = {
    id: generateId(),
    title,
    description: description || '',
    status: 'pending',
    priority: priority || 'medium',
    source: source || 'manual',
    projectId,
    assigneeId: assigneeId || null,
    creatorId,
    departmentId: departmentId || '',
    startDate: startDate || now,
    dueDate: dueDate || '',
    completedDate: null,
    estimatedHours: estimatedHours || 0,
    actualHours: null,
    tags: tags || [],
    dependencies: dependencies || [],
    approvalInstanceId: null,
    createdAt: now,
    updatedAt: now,
  }

  tasks.push(newTask)
  res.status(201).json({ success: true, data: newTask })
})

router.put('/:id', (req: Request, res: Response): void => {
  const idx = tasks.findIndex(t => t.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const allowedFields: (keyof Task)[] = [
    'title', 'description', 'priority', 'projectId', 'departmentId',
    'startDate', 'dueDate', 'estimatedHours', 'actualHours', 'tags',
    'dependencies',
  ]

  const now = new Date().toISOString()
  const updated = { ...tasks[idx], updatedAt: now }

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      (updated as any)[field] = req.body[field]
    }
  }

  tasks[idx] = updated
  res.json({ success: true, data: updated })
})

router.post('/:id/assign', (req: Request, res: Response): void => {
  const idx = tasks.findIndex(t => t.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const { assigneeId } = req.body
  if (!assigneeId) {
    res.status(400).json({ success: false, error: '缺少assigneeId' })
    return
  }

  const user = users.find(u => u.id === assigneeId)
  if (!user) {
    res.status(400).json({ success: false, error: '用户不存在' })
    return
  }

  tasks[idx].assigneeId = assigneeId
  if (tasks[idx].status === 'pending') {
    tasks[idx].status = 'in_progress'
  }
  tasks[idx].updatedAt = new Date().toISOString()

  res.json({ success: true, data: tasks[idx] })
})

router.put('/:id/status', (req: Request, res: Response): void => {
  const idx = tasks.findIndex(t => t.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const { status } = req.body
  const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled', 'blocked']
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: '无效的状态值' })
    return
  }

  tasks[idx].status = status
  tasks[idx].updatedAt = new Date().toISOString()

  if (status === 'completed') {
    tasks[idx].completedDate = new Date().toISOString().split('T')[0]
  } else {
    tasks[idx].completedDate = null
  }

  res.json({ success: true, data: tasks[idx] })
})

function calculateSkillMatch(userSkills: string[], taskTags: string[]): number {
  if (taskTags.length === 0) return 0.5

  const skillSet = new Set(userSkills.map(s => s.toLowerCase()))
  let matchCount = 0

  for (const tag of taskTags) {
    const tagLower = tag.toLowerCase()
    for (const skill of skillSet) {
      if (skill.includes(tagLower) || tagLower.includes(skill)) {
        matchCount++
        break
      }
    }
  }

  return matchCount / taskTags.length
}

export function handleRecommendations(req: Request, res: Response): void {
  const { taskId } = req.query
  const task = tasks.find(t => t.id === taskId)

  if (!task) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const availableUsers = users.filter(u =>
    u.status === 'online' && u.loadPercentage < 100
  )

  const recommendations = availableUsers.map(user => {
    const skillMatch = calculateSkillMatch(user.skills, task.tags)
    const loadScore = (100 - user.loadPercentage) / 100
    const performanceWeight = user.performanceScore / 100

    const totalScore = skillMatch * 0.5 + loadScore * 0.25 + performanceWeight * 0.25

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: departments.find(d => d.id === user.departmentId)?.name || '',
        role: roles.find(r => r.id === user.roleId)?.name || '',
        skills: user.skills,
        loadPercentage: user.loadPercentage,
        performanceScore: user.performanceScore,
      },
      scores: {
        skillMatch: Math.round(skillMatch * 100),
        loadScore: Math.round(loadScore * 100),
        performanceScore: Math.round(performanceWeight * 100),
        totalScore: Math.round(totalScore * 100),
      },
    }
  })

  recommendations.sort((a, b) => b.scores.totalScore - a.scores.totalScore)

  res.json({ success: true, data: recommendations.slice(0, 5) })
}

export default router
