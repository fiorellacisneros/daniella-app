import { useState, useEffect } from 'react'
import { Card, Button, Typography, Tag, Badge, Modal, Space, Avatar } from 'antd'
import { LeftOutlined, RightOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import './Calendar.css'

dayjs.locale('es')

const { Title, Text } = Typography

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDayTasks, setSelectedDayTasks] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [currentDate])

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading tasks:', error)
        setTasks([])
      } else {
        setTasks(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Obtener días del mes
  const getDaysInMonth = () => {
    const startOfMonth = currentDate.startOf('month')
    const endOfMonth = currentDate.endOf('month')
    const startDate = startOfMonth.startOf('week')
    const endDate = endOfMonth.endOf('week')
    
    const days = []
    let currentDay = startDate
    
    while (currentDay.isBefore(endDate) || currentDay.isSame(endDate, 'day')) {
      days.push(currentDay)
      currentDay = currentDay.add(1, 'day')
    }
    
    return days
  }

  // Obtener tareas para un día específico
  const getTasksForDay = (date) => {
    const dayName = date.format('dddd') // Lunes, Martes, etc.
    const dayNumber = date.date()
    const month = date.month() + 1
    const year = date.year()

    return tasks.filter(task => {
      // Tareas con fecha específica
      if (task.due_date) {
        const taskDate = dayjs(task.due_date)
        if (taskDate.isSame(date, 'day')) {
          return true
        }
      }

      // Tareas con días asignados (ej: Lunes, Miércoles, Viernes)
      if (task.assigned_days && task.assigned_days.length > 0) {
        const dayNamesMap = {
          'Lunes': 'monday',
          'Martes': 'tuesday',
          'Miércoles': 'wednesday',
          'Jueves': 'thursday',
          'Viernes': 'friday',
          'Sábado': 'saturday',
          'Domingo': 'sunday'
        }
        
        const normalizedDayName = dayName.toLowerCase()
        const assignedDaysNormalized = task.assigned_days.map(day => 
          dayNamesMap[day]?.toLowerCase() || day.toLowerCase()
        )
        
        if (assignedDaysNormalized.includes(normalizedDayName)) {
          return true
        }
      }

      return false
    })
  }

  // Verificar si un día tiene tareas
  const hasTasks = (date) => {
    return getTasksForDay(date).length > 0
  }

  // Manejar clic en un día
  const handleDayClick = (date) => {
    const dayTasks = getTasksForDay(date)
    setSelectedDate(date)
    setSelectedDayTasks(dayTasks)
    setIsModalVisible(true)
  }

  // Navegación de mes
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'))
  }

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'))
  }

  const goToToday = () => {
    setCurrentDate(dayjs())
  }

  const days = getDaysInMonth()
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const today = dayjs()

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={goToPreviousMonth}
          style={{ color: '#ECEFFF' }}
        />
        <div className="calendar-title">
          <Title level={3} style={{ color: '#ECEFFF', margin: 0, textTransform: 'capitalize', fontWeight: 700 }}>
            {currentDate.format('MMMM YYYY')}
          </Title>
          <Button
            type="link"
            onClick={goToToday}
            style={{ color: '#ECEFFF', fontSize: 12, padding: 0, fontWeight: 600, opacity: 0.9 }}
          >
            Hoy
          </Button>
        </div>
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={goToNextMonth}
          style={{ color: '#ECEFFF' }}
        />
      </div>

      <Card className="glass-card calendar-card">
        {/* Días de la semana */}
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <div key={index} className="weekday">
              <Text strong style={{ color: '#ECEFFF', fontSize: 12, fontWeight: 700, opacity: 0.9 }}>
                {day}
              </Text>
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="calendar-grid">
          {days.map((date, index) => {
            const isCurrentMonth = date.month() === currentDate.month()
            const isToday = date.isSame(today, 'day')
            const dayTasks = getTasksForDay(date)
            const hasTasksForDay = dayTasks.length > 0

            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${hasTasksForDay ? 'has-tasks' : ''}`}
                onClick={() => isCurrentMonth && handleDayClick(date)}
              >
                <div className="day-number">
                  <Text
                    style={{
                      color: isCurrentMonth ? '#ECEFFF' : 'rgba(236, 239, 255, 0.3)',
                      fontWeight: isToday ? 700 : 500,
                      fontSize: isToday ? 16 : 14,
                    }}
                  >
                    {date.date()}
                  </Text>
                </div>
                {hasTasksForDay && (
                  <div className="day-tasks-indicator">
                    {dayTasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="task-dot"
                        style={{
                          backgroundColor: task.status === 'completed' ? '#52c41a' : 
                                         task.status === 'in_progress' ? '#faad14' : '#492AAC'
                        }}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <Text style={{ color: '#ECEFFF', fontSize: 10, marginLeft: 2 }}>
                        +{dayTasks.length - 3}
                      </Text>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Lista de tareas del mes */}
        <div className="month-tasks-summary">
          <Title level={4} style={{ color: '#ECEFFF', marginBottom: 16, fontWeight: 700 }}>
            Tareas del Mes
          </Title>
        {tasks.filter(task => {
          // Filtrar tareas que aplican a este mes
          if (task.due_date) {
            const taskDate = dayjs(task.due_date)
            return taskDate.month() === currentDate.month() && 
                   taskDate.year() === currentDate.year()
          }
          // Si tiene días asignados, mostrar si alguno cae en este mes
          if (task.assigned_days && task.assigned_days.length > 0) {
            return true // Mostrar todas las tareas con días asignados
          }
          return false
        }).length === 0 ? (
          <Card className="glass-card" style={{ textAlign: 'center', padding: 24 }}>
            <Text style={{ color: 'rgba(236, 239, 255, 0.5)' }}>
              No hay tareas programadas para este mes
            </Text>
          </Card>
        ) : (
          <div className="tasks-list">
            {tasks
              .filter(task => {
                if (task.due_date) {
                  const taskDate = dayjs(task.due_date)
                  return taskDate.month() === currentDate.month() && 
                         taskDate.year() === currentDate.year()
                }
                return task.assigned_days && task.assigned_days.length > 0
              })
              .map((task) => (
                <Card
                  key={task.id}
                  className="glass-card task-item"
                  style={{ marginBottom: 12 }}
                >
                  <div className="task-item-header">
                  <div className="task-info">
                    <Text strong style={{ color: '#ECEFFF', fontSize: 16, fontWeight: 700 }}>
                      {task.title}
                    </Text>
                    {task.assigned_days && task.assigned_days.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong style={{ color: '#ECEFFF', fontSize: 12, opacity: 0.9, fontWeight: 600 }}>
                          Días: {task.assigned_days.join(', ')}
                        </Text>
                      </div>
                    )}
                    {task.due_date && (
                      <div style={{ marginTop: 4 }}>
                        <Text strong style={{ color: '#ECEFFF', fontSize: 12, opacity: 0.9, fontWeight: 600 }}>
                          📅 {dayjs(task.due_date).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    )}
                  </div>
                    <div className="task-meta">
                      <Tag color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                        {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </Tag>
                      {task.points && (
                        <Tag color="purple" style={{ marginTop: 4 }}>
                          {task.points} pts
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Modal de tareas del día */}
      <Modal
        title={
          <div>
            <Text strong style={{ color: '#ECEFFF', fontSize: 18, fontWeight: 700 }}>
              {selectedDate ? selectedDate.format('dddd, DD [de] MMMM') : ''}
            </Text>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 400 }}
      >
        {selectedDayTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Text style={{ color: 'rgba(236, 239, 255, 0.5)' }}>
              No hay tareas para este día
            </Text>
          </div>
        ) : (
          <div className="day-tasks-list">
            {selectedDayTasks.map((task) => (
              <Card
                key={task.id}
                className="glass-card"
                style={{ marginBottom: 12, background: 'rgba(73, 42, 172, 0.2)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {task.status === 'completed' && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                      <Text strong style={{ color: '#ECEFFF', fontWeight: 700 }}>
                        {task.title}
                      </Text>
                    </div>
                    {task.description && (
                      <Text strong style={{ color: '#ECEFFF', fontSize: 13, opacity: 0.9, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                        {task.description}
                      </Text>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {task.category && (
                        <Tag color="purple">{task.category}</Tag>
                      )}
                      {task.points && (
                        <Tag color="gold">🔥 {task.points} pts</Tag>
                      )}
                      {task.assigned_to && (
                        <Tag color="blue">👤 {task.assigned_to}</Tag>
                      )}
                    </div>
                  </div>
                  <Tag color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                    {task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '⏳' : '○'}
                  </Tag>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Calendar

