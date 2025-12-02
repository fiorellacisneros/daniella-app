import { useState, useEffect } from 'react'
import { Card, Button, Typography, Tag, Space, Empty, Checkbox } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined, FireOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import './Dashboard.css'

const { Title, Text } = Typography

const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
    loadTodayTasks()
    // Recargar cada minuto para actualizar el estado
    const interval = setInterval(loadTodayTasks, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadUser = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('name')
        .limit(1)

      if (!error && users && users.length > 0) {
        setUserName(users[0].name)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadTodayTasks = async () => {
    try {
      const today = dayjs()
      const dayName = today.format('dddd') // Lunes, Martes, etc.
      const dayNameMap = {
        'Monday': 'Lunes',
        'Tuesday': 'Martes',
        'Wednesday': 'Miércoles',
        'Thursday': 'Jueves',
        'Friday': 'Viernes',
        'Saturday': 'Sábado',
        'Sunday': 'Domingo'
      }
      const spanishDayName = dayNameMap[dayName] || dayName

      // Cargar todas las tareas
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('task_time', { ascending: true, nullsLast: true })

      if (error) {
        console.error('Error loading tasks:', error)
        setTodayTasks([])
        setLoading(false)
        return
      }

      // Filtrar tareas para hoy
      const todayTasksList = (tasks || []).filter(task => {
        // Tareas con fecha específica de hoy
        if (task.due_date) {
          const taskDate = dayjs(task.due_date)
          if (taskDate.isSame(today, 'day')) {
            return true
          }
        }

        // Tareas con días asignados que incluyen hoy
        if (task.assigned_days && task.assigned_days.length > 0) {
          return task.assigned_days.includes(spanishDayName)
        }

        return false
      })

      // Ordenar por hora
      todayTasksList.sort((a, b) => {
        if (!a.task_time && !b.task_time) return 0
        if (!a.task_time) return 1
        if (!b.task_time) return -1
        return a.task_time.localeCompare(b.task_time)
      })

      setTodayTasks(todayTasksList)
    } catch (error) {
      console.error('Error loading today tasks:', error)
      setTodayTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskId, completed) => {
    try {
      const newStatus = completed ? 'completed' : 'pending'
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      // Si se completa, actualizar puntos
      if (completed) {
        const task = todayTasks.find(t => t.id === taskId)
        if (task && task.points) {
          // Actualizar puntos del usuario
          const { data: users } = await supabase
            .from('users')
            .select('*')
            .limit(1)

          if (users && users.length > 0) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ total_points: (users[0].total_points || 0) + task.points })
              .eq('id', users[0].id)

            if (updateError) throw updateError
          }
        }
      }

      loadTodayTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getGreeting = () => {
    const hour = dayjs().hour()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const completedCount = todayTasks.filter(t => t.status === 'completed').length
  const totalCount = todayTasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Title level={2} style={{ color: '#ECEFFF', margin: 0, fontWeight: 700 }}>
            {getGreeting()}, {userName || 'Usuario'}
          </Title>
          <Text strong style={{ color: '#ECEFFF', fontSize: 14, opacity: 0.9 }}>
            {dayjs().format('dddd, DD [de] MMMM')}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/tasks')}
          size="large"
        >
          Nueva Tarea
        </Button>
      </div>

      {/* Progress Card */}
        <Card className="glass-card progress-card" style={{ marginBottom: 24 }}>
          <div className="progress-header">
            <div>
              <Text strong style={{ color: '#ECEFFF', fontSize: 14, opacity: 0.9 }}>
                Progreso de Hoy
              </Text>
              <Title level={3} style={{ color: '#ECEFFF', margin: '4px 0 0 0', fontWeight: 700 }}>
                {completedCount} de {totalCount} tareas
              </Title>
            </div>
            <div className="progress-circle">
              <Text strong style={{ color: '#ECEFFF', fontSize: 28, fontWeight: 800 }}>
                {progress}%
              </Text>
            </div>
          </div>
        <div className="progress-bar-container" style={{ marginTop: 16 }}>
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Today's Tasks */}
      <div className="today-tasks-section">
        <div className="section-header">
          <Title level={4} style={{ color: '#ECEFFF', margin: 0, fontWeight: 700 }}>
            Tareas de Hoy
          </Title>
          {todayTasks.length > 0 && (
            <Text strong style={{ color: '#ECEFFF', fontSize: 14, opacity: 0.9 }}>
              {completedCount}/{totalCount} completadas
            </Text>
          )}
        </div>

        {todayTasks.length === 0 ? (
          <Card className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
            <Empty
              description={
                <Text style={{ color: 'rgba(236, 239, 255, 0.5)' }}>
                  No hay tareas para hoy
                </Text>
              }
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/tasks')}
              style={{ marginTop: 16 }}
            >
              Agregar Tarea
            </Button>
          </Card>
        ) : (
          <div className="today-tasks-list">
            {todayTasks.map((task) => {
              const isCompleted = task.status === 'completed'
              const taskTime = task.task_time ? dayjs(task.task_time, 'HH:mm').format('HH:mm') : null
              
              return (
                <Card
                  key={task.id}
                  className={`glass-card task-card ${isCompleted ? 'completed' : ''}`}
                  style={{ marginBottom: 12 }}
                >
                  <div className="task-card-content">
                    <div className="task-main">
                      <Checkbox
                        checked={isCompleted}
                        onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
                        style={{ marginRight: 12 }}
                      >
                        <div className="task-info">
                          <Text
                            strong
                            style={{
                              color: '#ECEFFF',
                              fontSize: 16,
                              fontWeight: 700,
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.7 : 1,
                            }}
                          >
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text
                              style={{
                                color: '#ECEFFF',
                                fontSize: 13,
                                opacity: 0.8,
                                display: 'block',
                                marginTop: 4,
                                fontWeight: 500,
                              }}
                            >
                              {task.description}
                            </Text>
                          )}
                        </div>
                      </Checkbox>
                    </div>
                    <div className="task-meta">
                      {taskTime && (
                        <Tag color="cyan" style={{ marginBottom: 4 }}>
                          <ClockCircleOutlined /> {taskTime}
                        </Tag>
                      )}
                      {task.points && (
                        <Tag color="purple">
                          <FireOutlined /> {task.points} pts
                        </Tag>
                      )}
                      {task.category && (
                        <Tag color="blue" style={{ marginTop: 4 }}>
                          {task.category}
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
