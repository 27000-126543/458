import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'
import { tasks, users, generateId } from './db/mockData.js'

interface ClientConnection {
  ws: WebSocket
  userId: string | null
  isAlive: boolean
}

const clients: Map<WebSocket, ClientConnection> = new Map()
let wss: WebSocketServer | null = null

export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws: WebSocket) => {
    const client: ClientConnection = {
      ws,
      userId: null,
      isAlive: true,
    }
    clients.set(ws, client)

    ws.on('pong', () => {
      const c = clients.get(ws)
      if (c) c.isAlive = true
    })

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        handleMessage(ws, message)
      } catch {
        ws.send(JSON.stringify({ type: 'error', content: 'Invalid message format' }))
      }
    })

    ws.on('close', () => {
      clients.delete(ws)
    })

    ws.send(JSON.stringify({
      type: 'connected',
      content: 'WebSocket连接已建立',
      timestamp: new Date().toISOString(),
    }))
  })

  const heartbeat = setInterval(() => {
    wss?.clients.forEach((ws) => {
      const client = clients.get(ws)
      if (!client?.isAlive) {
        clients.delete(ws)
        return ws.terminate()
      }
      client.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => {
    clearInterval(heartbeat)
  })

  startSimulation()

  return wss
}

function handleMessage(ws: WebSocket, message: any): void {
  const { type, payload } = message

  switch (type) {
    case 'identify':
      const client = clients.get(ws)
      if (client) {
        client.userId = payload?.userId || null
      }
      ws.send(JSON.stringify({
        type: 'identified',
        content: `用户 ${payload?.userId} 已连接`,
        timestamp: new Date().toISOString(),
      }))
      break

    case 'subscribe':
      ws.send(JSON.stringify({
        type: 'subscribed',
        content: `已订阅 ${payload?.channel || 'all'}`,
        timestamp: new Date().toISOString(),
      }))
      break

    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString(),
      }))
      break

    default:
      ws.send(JSON.stringify({
        type: 'error',
        content: `未知消息类型: ${type}`,
        timestamp: new Date().toISOString(),
      }))
  }
}

export function broadcast(message: any): void {
  const data = JSON.stringify({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
  })

  wss?.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })
}

export function sendToUser(userId: string, message: any): void {
  const data = JSON.stringify({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
  })

  clients.forEach((client, ws) => {
    if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })
}

const simulationEvents = [
  {
    type: 'task_status_changed',
    generateContent: () => {
      const activeTasks = tasks.filter(t => t.status === 'in_progress')
      if (activeTasks.length === 0) return null
      const task = activeTasks[Math.floor(Math.random() * activeTasks.length)]
      const user = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null
      return {
        taskId: task.id,
        taskTitle: task.title,
        fromStatus: 'in_progress',
        toStatus: 'review',
        changedBy: user?.name || '系统',
      }
    },
  },
  {
    type: 'new_notification',
    generateContent: () => {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const notifications = [
        '您有一条新的待审批任务',
        '项目进度已更新',
        '有新评论需要查看',
        '任务即将到期',
        '团队会议提醒',
      ]
      return {
        userId: randomUser.id,
        title: '系统通知',
        content: notifications[Math.floor(Math.random() * notifications.length)],
      }
    },
  },
  {
    type: 'task_assigned',
    generateContent: () => {
      const pendingTasks = tasks.filter(t => t.status === 'pending' && !t.assigneeId)
      const onlineUsers = users.filter(u => u.status === 'online' && u.loadPercentage < 80)
      if (pendingTasks.length === 0 || onlineUsers.length === 0) return null
      const task = pendingTasks[Math.floor(Math.random() * pendingTasks.length)]
      const user = onlineUsers[Math.floor(Math.random() * onlineUsers.length)]
      return {
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: user.id,
        assigneeName: user.name,
      }
    },
  },
]

let simulationTimer: ReturnType<typeof setInterval> | null = null

function startSimulation(): void {
  if (simulationTimer) return

  simulationTimer = setInterval(() => {
    const event = simulationEvents[Math.floor(Math.random() * simulationEvents.length)]
    const content = event.generateContent()

    if (!content) return

    const message = {
      type: event.type,
      content,
      id: generateId(),
    }

    if (event.type === 'new_notification' && 'userId' in content) {
      broadcast(message)
    } else {
      broadcast(message)
    }
  }, 15000 + Math.random() * 30000)
}

export function stopSimulation(): void {
  if (simulationTimer) {
    clearInterval(simulationTimer)
    simulationTimer = null
  }
}

export function getConnectedClients(): number {
  return clients.size
}
