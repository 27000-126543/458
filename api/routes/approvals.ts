import { Router, type Request, type Response } from 'express'
import {
  approvalInstances,
  approvalFlows,
  approvalActions,
  users,
  tasks,
  generateId,
  type ApprovalFlow,
  type ApprovalInstance,
} from '../db/mockData.js'

const router = Router()
const flowRouter = Router()

router.get('/', (req: Request, res: Response): void => {
  let result = [...approvalInstances]

  const { status, initiatorId, flowId } = req.query

  if (status) {
    result = result.filter(a => a.status === status)
  }
  if (initiatorId) {
    result = result.filter(a => a.initiatorId === initiatorId)
  }
  if (flowId) {
    result = result.filter(a => a.flowId === flowId)
  }

  const enriched = result.map(inst => ({
    ...inst,
    initiator: users.find(u => u.id === inst.initiatorId) || null,
    flow: approvalFlows.find(f => f.id === inst.flowId) || null,
    task: inst.taskId ? tasks.find(t => t.id === inst.taskId) || null : null,
    actions: approvalActions.filter(a => a.instanceId === inst.id).map(action => ({
      ...action,
      user: users.find(u => u.id === action.userId) || null,
      transferToUser: action.transferToUserId ? users.find(u => u.id === action.transferToUserId) || null : null,
    })),
  }))

  res.json({ success: true, data: enriched, total: enriched.length })
})

router.get('/:id', (req: Request, res: Response): void => {
  const inst = approvalInstances.find(a => a.id === req.params.id)
  if (!inst) {
    res.status(404).json({ success: false, error: '审批实例不存在' })
    return
  }

  const flow = approvalFlows.find(f => f.id === inst.flowId)
  const currentNode = flow?.nodes.find(n => n.id === inst.currentNodeId)

  const enriched = {
    ...inst,
    initiator: users.find(u => u.id === inst.initiatorId) || null,
    flow: flow || null,
    currentNode: currentNode || null,
    task: inst.taskId ? tasks.find(t => t.id === inst.taskId) || null : null,
    actions: approvalActions.filter(a => a.instanceId === inst.id).map(action => ({
      ...action,
      user: users.find(u => u.id === action.userId) || null,
      transferToUser: action.transferToUserId ? users.find(u => u.id === action.transferToUserId) || null : null,
    })),
  }

  res.json({ success: true, data: enriched })
})

router.post('/', (req: Request, res: Response): void => {
  const { flowId, title, description, taskId, initiatorId } = req.body

  if (!flowId || !title || !initiatorId) {
    res.status(400).json({ success: false, error: '缺少必填字段: flowId, title, initiatorId' })
    return
  }

  const flow = approvalFlows.find(f => f.id === flowId)
  if (!flow) {
    res.status(400).json({ success: false, error: '审批流程不存在' })
    return
  }

  const firstApprovalNode = flow.nodes.find(n => n.type === 'approval')
  if (!firstApprovalNode) {
    res.status(400).json({ success: false, error: '审批流程缺少审批节点' })
    return
  }

  const now = new Date().toISOString()
  const newInstance: ApprovalInstance = {
    id: generateId(),
    flowId,
    title,
    description: description || '',
    taskId: taskId || null,
    status: 'pending',
    currentStep: 1,
    initiatorId,
    currentNodeId: firstApprovalNode.id,
    createdAt: now,
    updatedAt: now,
  }

  approvalInstances.push(newInstance)

  if (taskId) {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      task.approvalInstanceId = newInstance.id
    }
  }

  res.status(201).json({ success: true, data: newInstance })
})

router.put('/:id/action', (req: Request, res: Response): void => {
  const idx = approvalInstances.findIndex(a => a.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '审批实例不存在' })
    return
  }

  const { action, userId, comment, transferToUserId } = req.body
  if (!action || !userId) {
    res.status(400).json({ success: false, error: '缺少必填字段: action, userId' })
    return
  }

  const validActions = ['approve', 'reject', 'transfer']
  if (!validActions.includes(action)) {
    res.status(400).json({ success: false, error: '无效的操作类型' })
    return
  }

  const inst = approvalInstances[idx]
  const flow = approvalFlows.find(f => f.id === inst.flowId)

  const now = new Date().toISOString()

  if (action === 'transfer') {
    if (!transferToUserId) {
      res.status(400).json({ success: false, error: '转审需要指定transferToUserId' })
      return
    }
    const transferToUser = users.find(u => u.id === transferToUserId)
    if (!transferToUser) {
      res.status(400).json({ success: false, error: '转审接收人不存在' })
      return
    }
  }

  approvalActions.push({
    id: generateId(),
    instanceId: inst.id,
    nodeId: inst.currentNodeId,
    userId,
    action,
    comment: comment || '',
    transferToUserId: action === 'transfer' ? transferToUserId : undefined,
    createdAt: now,
  })

  if (action === 'approve' && flow) {
    const currentEdge = flow.edges.find(e => e.source === inst.currentNodeId)
    if (currentEdge) {
      const nextNode = flow.nodes.find(n => n.id === currentEdge.target)
      if (nextNode) {
        inst.currentNodeId = nextNode.id
        inst.currentStep += 1
        if (nextNode.type === 'end') {
          inst.status = 'approved'
        }
      }
    } else {
      inst.status = 'approved'
    }
  } else if (action === 'reject') {
    inst.status = 'rejected'
  } else if (action === 'transfer') {
    inst.status = 'pending'
  }

  inst.updatedAt = now

  const currentNode = flow?.nodes.find(n => n.id === inst.currentNodeId)
  const enriched = {
    ...inst,
    initiator: users.find(u => u.id === inst.initiatorId) || null,
    flow: flow || null,
    currentNode: currentNode || null,
    task: inst.taskId ? tasks.find(t => t.id === inst.taskId) || null : null,
    actions: approvalActions.filter(a => a.instanceId === inst.id).map(action => ({
      ...action,
      user: users.find(u => u.id === action.userId) || null,
      transferToUser: action.transferToUserId ? users.find(u => u.id === action.transferToUserId) || null : null,
    })),
  }

  res.json({ success: true, data: enriched })
})

flowRouter.get('/', (_req: Request, res: Response): void => {
  const enriched = approvalFlows.map(flow => ({
    ...flow,
    instanceCount: approvalInstances.filter(i => i.flowId === flow.id).length,
  }))

  res.json({ success: true, data: enriched, total: enriched.length })
})

flowRouter.post('/', (req: Request, res: Response): void => {
  const { name, description, nodes, edges } = req.body

  if (!name || !nodes || !edges) {
    res.status(400).json({ success: false, error: '缺少必填字段: name, nodes, edges' })
    return
  }

  const now = new Date().toISOString()
  const newFlow: ApprovalFlow = {
    id: generateId(),
    name,
    description: description || '',
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  }

  approvalFlows.push(newFlow)
  res.status(201).json({ success: true, data: newFlow })
})

flowRouter.put('/:id', (req: Request, res: Response): void => {
  const idx = approvalFlows.findIndex(f => f.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '审批流程不存在' })
    return
  }

  const { name, description, nodes, edges } = req.body
  const now = new Date().toISOString()
  const updated = { ...approvalFlows[idx], updatedAt: now }

  if (name !== undefined) updated.name = name
  if (description !== undefined) updated.description = description
  if (nodes !== undefined) updated.nodes = nodes
  if (edges !== undefined) updated.edges = edges

  approvalFlows[idx] = updated
  res.json({ success: true, data: updated })
})

export { flowRouter }
export default router
