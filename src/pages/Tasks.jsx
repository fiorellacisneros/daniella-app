import { useState, useEffect } from 'react'
import { Card, Button, Input, Select, DatePicker, Space, Tag, Modal, Form, InputNumber, message, Typography, Collapse, TimePicker } from 'antd'
import { PlusOutlined, FilterOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, BellOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import ReminderManager from '../components/ReminderManager'
import dayjs from 'dayjs'
import './Tasks.css'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [form] = Form.useForm()
  const [categories] = useState([
    'Cocina',
    'Limpieza',
    'Jardín',
    'Lavandería',
    'Mantenimiento',
    'Compras',
    'Otros'
  ])
  const [members] = useState([
    { id: 1, name: 'Usuario 1' },
    { id: 2, name: 'Usuario 2' },
    { id: 3, name: 'Usuario 3' },
  ])

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, filterStatus, filterCategory])

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      message.error('Error al cargar las tareas')
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(task => task.category === filterCategory)
    }

    setFilteredTasks(filtered)
  }

  const handleAddTask = () => {
    setEditingTask(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    form.setFieldsValue({
      ...task,
      assigned_days: task.assigned_days || [],
      due_date: task.due_date ? dayjs(task.due_date) : null,
      task_time: task.task_time ? dayjs(task.task_time, 'HH:mm') : null,
    })
    setIsModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      const taskData = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        task_time: values.task_time ? values.task_time.format('HH:mm') : null,
        assigned_days: values.assigned_days || [],
        status: editingTask?.status || 'pending',
        points: values.points || 0,
      }

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id)

        if (error) throw error
        message.success('Tarea actualizada correctamente')
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData])

        if (error) throw error
        message.success('Tarea creada correctamente')
      }

      setIsModalVisible(false)
      form.resetFields()
      loadTasks()
    } catch (error) {
      console.error('Error saving task:', error)
      message.error('Error al guardar la tarea')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      // Si se completa, agregar puntos al usuario
      if (newStatus === 'completed') {
        const task = tasks.find(t => t.id === taskId)
        if (task && task.points) {
          // Aquí deberías actualizar los puntos del usuario en la tabla users
          message.success(`¡Ganaste ${task.points} puntos!`)
        }
      }

      message.success('Estado actualizado')
      loadTasks()
    } catch (error) {
      console.error('Error updating status:', error)
      message.error('Error al actualizar el estado')
    }
  }

  const handleDelete = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      message.success('Tarea eliminada')
      loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      message.error('Error al eliminar la tarea')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'in_progress':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />
      default:
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h2 style={{ color: '#ECEFFF', margin: 0, fontWeight: 700 }}>Tareas</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTask}
          size="large"
        >
          Nueva Tarea
        </Button>
      </div>

      <div className="tasks-filters">
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ width: '100%', marginBottom: 12 }}
        >
          <Option value="all">Todos los estados</Option>
          <Option value="pending">Pendiente</Option>
          <Option value="in_progress">En Progreso</Option>
          <Option value="completed">Completada</Option>
        </Select>
        <Select
          value={filterCategory}
          onChange={setFilterCategory}
          style={{ width: '100%' }}
        >
          <Option value="all">Todas las categorías</Option>
          {categories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <Card className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'rgba(236, 239, 255, 0.5)' }}>
              No hay tareas {filterStatus !== 'all' || filterCategory !== 'all' ? 'con estos filtros' : ''}
            </p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="glass-card task-card"
              style={{ marginBottom: 16 }}
            >
              <div className="task-card-header">
                <div className="task-title-section">
                  {getStatusIcon(task.status)}
                  <h3 style={{ color: '#ECEFFF', margin: '0 0 0 8px', flex: 1, fontWeight: 700 }}>
                    {task.title}
                  </h3>
                </div>
                <Tag color={getStatusColor(task.status)}>
                  {task.status === 'completed' ? 'Completada' : 
                   task.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                </Tag>
              </div>

              {task.description && (
                <p style={{ color: '#ECEFFF', margin: '8px 0', opacity: 0.9, fontWeight: 500 }}>
                  {task.description}
                </p>
              )}

              <div className="task-meta">
                {task.category && (
                  <Tag color="purple">{task.category}</Tag>
                )}
                {task.points && (
                  <Tag color="gold">🔥 {task.points} pts</Tag>
                )}
                {task.assigned_to && (
                  <Tag color="blue">👤 {task.assigned_to}</Tag>
                )}
                {task.due_date && (
                  <Tag color="cyan">
                    📅 {dayjs(task.due_date).format('DD/MM/YYYY')}
                  </Tag>
                )}
                {task.task_time && (
                  <Tag color="orange">
                    🕐 {task.task_time}
                  </Tag>
                )}
              </div>

              {task.assigned_days && task.assigned_days.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ color: '#ECEFFF', fontSize: 12, opacity: 0.9, fontWeight: 600 }}>
                    Días asignados: {task.assigned_days.join(', ')}
                  </Text>
                </div>
              )}

              <Collapse
                ghost
                style={{ marginTop: 12 }}
                items={[
                  {
                    key: 'reminders',
                    label: (
                      <span style={{ color: '#ECEFFF' }}>
                        <BellOutlined style={{ marginRight: 8 }} />
                        Gestionar Recordatorios
                      </span>
                    ),
                    children: <ReminderManager taskId={task.id} taskTitle={task.title} />,
                  },
                ]}
              />

              <div className="task-actions" style={{ marginTop: 16 }}>
                <Space>
                  {task.status !== 'completed' && (
                    <>
                      {task.status !== 'in_progress' && (
                        <Button
                          size="small"
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                        >
                          En Progreso
                        </Button>
                      )}
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleStatusChange(task.id, 'completed')}
                      >
                        Completar
                      </Button>
                    </>
                  )}
                  <Button
                    size="small"
                    onClick={() => handleEditTask(task)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: '¿Eliminar tarea?',
                        content: 'Esta acción no se puede deshacer',
                        onOk: () => handleDelete(task.id),
                      })
                    }}
                  >
                    Eliminar
                  </Button>
                </Space>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 500 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Por favor ingresa un título' }]}
          >
            <Input placeholder="Ej: Lavar los platos" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea rows={3} placeholder="Descripción de la tarea..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Categoría"
            rules={[{ required: true, message: 'Selecciona una categoría' }]}
          >
            <Select placeholder="Selecciona una categoría">
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label="Puntos"
            rules={[{ required: true, message: 'Asigna puntos a la tarea' }]}
          >
            <InputNumber
              min={0}
              max={1000}
              placeholder="Puntos por completar"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="assigned_to"
            label="Asignar a"
          >
            <Select placeholder="Selecciona una persona" allowClear>
              {members.map(member => (
                <Option key={member.id} value={member.name}>{member.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="assigned_days"
            label="Días de la semana"
          >
            <Select
              mode="multiple"
              placeholder="Selecciona los días"
              allowClear
            >
              <Option value="Lunes">Lunes</Option>
              <Option value="Martes">Martes</Option>
              <Option value="Miércoles">Miércoles</Option>
              <Option value="Jueves">Jueves</Option>
              <Option value="Viernes">Viernes</Option>
              <Option value="Sábado">Sábado</Option>
              <Option value="Domingo">Domingo</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="due_date"
            label="Fecha límite"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="task_time"
            label="Hora de la tarea"
            tooltip="Hora en la que normalmente realizas esta tarea"
          >
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              placeholder="Selecciona la hora"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Tasks

