import { useState, useEffect } from 'react'
import { Card, Button, TimePicker, Select, Space, Tag, Modal, Form, message, Switch } from 'antd'
import { BellOutlined, DeleteOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import './ReminderManager.css'

const { Option } = Select

const ReminderManager = ({ taskId, taskTitle }) => {
  const [reminders, setReminders] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (taskId) {
      loadReminders()
    }
  }, [taskId])

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('task_id', taskId)
        .eq('is_active', true)

      if (error) throw error
      setReminders(data || [])
    } catch (error) {
      console.error('Error loading reminders:', error)
    }
  }

  const handleAddReminder = () => {
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      const reminderData = {
        task_id: taskId,
        reminder_time: values.time.format('HH:mm:ss'),
        days_of_week: values.days || [],
        is_active: true,
      }

      const { error } = await supabase
        .from('reminders')
        .insert([reminderData])

      if (error) throw error
      message.success('Recordatorio creado correctamente')
      setIsModalVisible(false)
      form.resetFields()
      loadReminders()
    } catch (error) {
      console.error('Error saving reminder:', error)
      message.error('Error al guardar el recordatorio')
    }
  }

  const handleDelete = async (reminderId) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: false })
        .eq('id', reminderId)

      if (error) throw error
      message.success('Recordatorio eliminado')
      loadReminders()
    } catch (error) {
      console.error('Error deleting reminder:', error)
      message.error('Error al eliminar el recordatorio')
    }
  }

  const formatDays = (days) => {
    if (!days || days.length === 0) return 'Todos los días'
    if (days.length === 7) return 'Todos los días'
    return days.join(', ')
  }

  return (
    <div className="reminder-manager">
      <div className="reminder-header">
        <BellOutlined style={{ fontSize: 18, color: '#ECEFFF' }} />
        <span style={{ color: '#ECEFFF', marginLeft: 8, fontWeight: 700 }}>
          Recordatorios
        </span>
        <Button
          type="primary"
          size="small"
          onClick={handleAddReminder}
          style={{ marginLeft: 'auto' }}
        >
          Agregar
        </Button>
      </div>

      {reminders.length === 0 ? (
        <div style={{ padding: '12px 0', color: 'rgba(236, 239, 255, 0.5)', fontSize: 14 }}>
          No hay recordatorios configurados
        </div>
      ) : (
        <div className="reminders-list">
          {reminders.map((reminder) => (
            <Card
              key={reminder.id}
              className="glass-card reminder-item"
              size="small"
            >
              <div className="reminder-item-content">
                <div className="reminder-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BellOutlined style={{ color: '#ECEFFF', opacity: 0.9 }} />
                    <span style={{ color: '#ECEFFF', fontWeight: 700 }}>
                      {reminder.reminder_time}
                    </span>
                  </div>
                  <Tag color="purple" style={{ marginTop: 8 }}>
                    {formatDays(reminder.days_of_week)}
                  </Tag>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: '¿Eliminar recordatorio?',
                      onOk: () => handleDelete(reminder.id),
                    })
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="Nuevo Recordatorio"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 400 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="time"
            label="Hora del recordatorio"
            rules={[{ required: true, message: 'Selecciona una hora' }]}
          >
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              placeholder="Selecciona la hora"
            />
          </Form.Item>

          <Form.Item
            name="days"
            label="Días de la semana"
            tooltip="Deja vacío para todos los días"
          >
            <Select
              mode="multiple"
              placeholder="Selecciona los días (opcional)"
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

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Crear
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ReminderManager

