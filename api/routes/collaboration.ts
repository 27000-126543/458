import { Router, type Request, type Response } from 'express'
import {
  comments,
  attachments,
  notifications,
  users,
  tasks,
  generateId,
  type Comment,
  type Attachment,
} from '../db/mockData.js'

const router = Router()

router.get('/tasks/:taskId/comments', (req: Request, res: Response): void => {
  const taskComments = comments
    .filter(c => c.taskId === req.params.taskId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(c => ({
      ...c,
      user: users.find(u => u.id === c.userId) || null,
    }))

  res.json({ success: true, data: taskComments, total: taskComments.length })
})

router.post('/tasks/:taskId/comments', (req: Request, res: Response): void => {
  const { userId, content } = req.body
  if (!userId || !content) {
    res.status(400).json({ success: false, error: '缺少必填字段: userId, content' })
    return
  }

  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const now = new Date().toISOString()
  const newComment: Comment = {
    id: generateId(),
    taskId: req.params.taskId,
    userId,
    content,
    createdAt: now,
    updatedAt: now,
  }

  comments.push(newComment)

  res.status(201).json({
    success: true,
    data: {
      ...newComment,
      user: users.find(u => u.id === userId) || null,
    },
  })
})

router.get('/tasks/:taskId/attachments', (req: Request, res: Response): void => {
  const taskAttachments = attachments
    .filter(a => a.taskId === req.params.taskId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(a => ({
      ...a,
      user: users.find(u => u.id === a.userId) || null,
    }))

  res.json({ success: true, data: taskAttachments, total: taskAttachments.length })
})

router.post('/tasks/:taskId/attachments', (req: Request, res: Response): void => {
  const { userId, fileName, fileUrl, fileSize, fileType } = req.body
  if (!userId || !fileName || !fileUrl) {
    res.status(400).json({ success: false, error: '缺少必填字段: userId, fileName, fileUrl' })
    return
  }

  const task = tasks.find(t => t.id === req.params.taskId)
  if (!task) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }

  const newAttachment: Attachment = {
    id: generateId(),
    taskId: req.params.taskId,
    userId,
    fileName,
    fileUrl,
    fileSize: fileSize || 0,
    fileType: fileType || '',
    createdAt: new Date().toISOString(),
  }

  attachments.push(newAttachment)

  res.status(201).json({
    success: true,
    data: {
      ...newAttachment,
      user: users.find(u => u.id === userId) || null,
    },
  })
})

router.get('/notifications', (req: Request, res: Response): void => {
  const { userId, read, type } = req.query

  let result = [...notifications]

  if (userId) {
    result = result.filter(n => n.userId === userId)
  }
  if (read !== undefined) {
    result = result.filter(n => n.read === (read === 'true'))
  }
  if (type) {
    result = result.filter(n => n.type === type)
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const enriched = result.map(n => ({
    ...n,
    user: users.find(u => u.id === n.userId) || null,
  }))

  res.json({ success: true, data: enriched, total: enriched.length })
})

export default router
