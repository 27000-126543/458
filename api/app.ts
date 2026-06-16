import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import taskRoutes, { handleRecommendations } from './routes/tasks.js'
import approvalRoutes, { flowRouter } from './routes/approvals.js'
import dashboardRoutes from './routes/dashboard.js'
import performanceRoutes from './routes/performance.js'
import collaborationRoutes from './routes/collaboration.js'
import { users, departments, roles } from './db/mockData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/approval-flows', flowRouter)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/performance', performanceRoutes)
app.use('/api', collaborationRoutes)

app.get('/api/recommendations', handleRecommendations)

app.get('/api/users', (req: Request, res: Response): void => {
  const { departmentId } = req.query
  let result = [...users]
  if (departmentId) {
    result = result.filter(u => u.departmentId === departmentId)
  }
  const enriched = result.map(u => ({
    ...u,
    department: departments.find(d => d.id === u.departmentId) || null,
    role: roles.find(r => r.id === u.roleId) || null,
  }))
  res.json({ success: true, data: enriched })
})

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
