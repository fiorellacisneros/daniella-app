import { useState } from 'react'
import { Card, Button, Input, Select, DatePicker, Space, Typography, Steps, Form, TimePicker, InputNumber, message } from 'antd'
import { UserOutlined, CheckCircleOutlined, CalendarOutlined, TrophyOutlined, SmileOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import './Onboarding.css'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [tasks, setTasks] = useState([])

  const steps = [
    {
      title: 'Bienvenido',
      icon: <SmileOutlined />,
    },
    {
      title: 'Tu Nombre',
      icon: <UserOutlined />,
    },
    {
      title: 'Tus Tareas',
      icon: <CheckCircleOutlined />,
    },
    {
      title: '¡Listo!',
      icon: <TrophyOutlined />,
    },
  ]

  const categories = [
    'Cocina',
    'Limpieza',
    'Jardín',
    'Lavandería',
    'Mantenimiento',
    'Compras',
    'Otros'
  ]

  const daysOfWeek = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ]

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validar nombre
      const values = await form.validateFields(['name'])
      if (!values.name) {
        message.error('Por favor ingresa tu nombre')
        return
      }
    }

    if (currentStep === 2) {
      // Guardar usuario y tareas
      try {
        const formValues = form.getFieldsValue()
        
        // Obtener usuario autenticado
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          message.error('No hay sesión activa. Por favor inicia sesión.')
          return
        }

        // Crear o actualizar usuario
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single()

        let user
        if (existingUser) {
          // Actualizar usuario existente
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              name: formValues.name,
              auth_user_id: authUser.id,
            })
            .eq('id', existingUser.id)
            .select()
            .single()

          if (updateError) throw updateError
          user = updatedUser
        } else {
          // Crear nuevo usuario
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{
              name: formValues.name,
              email: authUser.email,
              auth_user_id: authUser.id,
              total_points: 0,
            }])
            .select()
            .single()

          if (userError) throw userError
          user = newUser
        }

        // Crear tareas
        if (tasks.length > 0) {
          const tasksToInsert = tasks
            .filter(task => task.title && task.category) // Solo tareas válidas
            .map(task => ({
              title: task.title,
              description: task.description,
              category: task.category,
              points: task.points || 10,
              assigned_to: formValues.name,
              assigned_days: task.assigned_days || [],
              due_date: task.due_date || null,
              task_time: task.task_time || null,
              created_by: user.id,
              status: 'pending',
            }))

          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert)

          if (tasksError) throw tasksError
        }

        message.success('¡Configuración completada!')
        onComplete()
      } catch (error) {
        console.error('Error saving onboarding:', error)
        message.error('Error al guardar la configuración')
      }
      return
    }

    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      title: '',
      category: '',
      points: 10,
      assigned_days: [],
      task_time: null,
    }
    setTasks([...tasks, newTask])
  }

  const handleUpdateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ))
  }

  const handleRemoveTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="onboarding-welcome">
            <div className="welcome-icon">
              <SmileOutlined style={{ fontSize: 80, color: '#492AAC' }} />
            </div>
            <Title level={2} style={{ color: '#ECEFFF', textAlign: 'center', marginTop: 24, fontWeight: 700 }}>
              ¡Bienvenido a Daniella!
            </Title>
            <Text strong style={{ color: '#ECEFFF', textAlign: 'center', display: 'block', fontSize: 16, lineHeight: 1.6, opacity: 0.9, fontWeight: 500 }}>
              Vamos a configurar tu perfil y tus tareas del hogar.
              <br />
              Esto te ayudará a organizarte mejor y ganar premios increíbles.
            </Text>
          </div>
        )

      case 1:
        return (
          <div className="onboarding-form">
            <Title level={3} style={{ color: '#ECEFFF', marginBottom: 24, fontWeight: 700 }}>
              Cuéntanos sobre ti
            </Title>
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label={<span style={{ color: '#ECEFFF' }}>Tu Nombre</span>}
                rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
              >
                <Input 
                  placeholder="Ej: Juan" 
                  size="large"
                  style={{ fontSize: 16 }}
                />
              </Form.Item>
              <Form.Item
                name="email"
                label={<span style={{ color: '#ECEFFF' }}>Email (opcional)</span>}
              >
                <Input 
                  type="email"
                  placeholder="tu@email.com" 
                  size="large"
                />
              </Form.Item>
            </Form>
          </div>
        )

      case 2:
        return (
          <div className="onboarding-tasks">
            <Title level={3} style={{ color: '#ECEFFF', marginBottom: 16, fontWeight: 700 }}>
              Configura tus tareas
            </Title>
            <Text strong style={{ color: '#ECEFFF', display: 'block', marginBottom: 24, opacity: 0.9, fontWeight: 500 }}>
              Agrega las tareas que realizas regularmente. Puedes asignarles días específicos y horarios.
            </Text>

            <div className="tasks-list">
              {tasks.map((task, index) => (
                <Card key={task.id} className="glass-card" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input
                      placeholder="Nombre de la tarea (ej: Hacer el desayuno)"
                      value={task.title}
                      onChange={(e) => handleUpdateTask(task.id, 'title', e.target.value)}
                      size="large"
                    />
                    <Select
                      placeholder="Categoría"
                      value={task.category}
                      onChange={(value) => handleUpdateTask(task.id, 'category', value)}
                      style={{ width: '100%' }}
                    >
                      {categories.map(cat => (
                        <Option key={cat} value={cat}>{cat}</Option>
                      ))}
                    </Select>
                    <Select
                      mode="multiple"
                      placeholder="Días de la semana"
                      value={task.assigned_days}
                      onChange={(value) => handleUpdateTask(task.id, 'assigned_days', value)}
                      style={{ width: '100%' }}
                    >
                      {daysOfWeek.map(day => (
                        <Option key={day} value={day}>{day}</Option>
                      ))}
                    </Select>
                    <Space style={{ width: '100%' }}>
                      <TimePicker
                        placeholder="Hora (opcional)"
                        format="HH:mm"
                        value={task.task_time ? dayjs(task.task_time, 'HH:mm') : null}
                        onChange={(time) => handleUpdateTask(task.id, 'task_time', time ? time.format('HH:mm') : null)}
                        style={{ flex: 1 }}
                      />
                      <InputNumber
                        placeholder="Puntos"
                        min={1}
                        max={100}
                        value={task.points}
                        onChange={(value) => handleUpdateTask(task.id, 'points', value)}
                        style={{ width: 100 }}
                      />
                    </Space>
                    <Button
                      danger
                      onClick={() => handleRemoveTask(task.id)}
                      block
                    >
                      Eliminar
                    </Button>
                  </Space>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={handleAddTask}
                block
                size="large"
                style={{ marginTop: 16 }}
              >
                + Agregar Tarea
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="onboarding-complete">
            <div className="complete-icon">
              <TrophyOutlined style={{ fontSize: 80, color: '#52c41a' }} />
            </div>
            <Title level={2} style={{ color: '#ECEFFF', textAlign: 'center', marginTop: 24, fontWeight: 700 }}>
              ¡Todo Listo!
            </Title>
            <Text strong style={{ color: '#ECEFFF', textAlign: 'center', display: 'block', fontSize: 16, lineHeight: 1.6, opacity: 0.9, fontWeight: 500 }}>
              Ya puedes comenzar a completar tus tareas y ganar puntos.
              <br />
              ¡Juntos pueden ganar premios increíbles!
            </Text>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <Steps
          current={currentStep}
          items={steps}
          className="onboarding-steps"
        />
        
        <div className="onboarding-step-content">
          {renderStepContent()}
        </div>

        <div className="onboarding-actions">
          {currentStep > 0 && (
            <Button onClick={handleBack} size="large">
              Atrás
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleNext}
            size="large"
            style={{ marginLeft: 'auto' }}
          >
            {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding

