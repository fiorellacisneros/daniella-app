import { useState, useEffect } from 'react'
import { Card, Avatar, Typography, Progress, Tag, Statistic, Row, Col, Modal, Form, Input, Button, Upload, message } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, FireOutlined, SettingOutlined, BellOutlined, EditOutlined, CameraOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import './Profile.css'

const { Title, Text } = Typography

const Profile = () => {
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalTasks: 0,
    rank: 0,
  })
  const [user, setUser] = useState({
    name: 'Usuario',
    photo_url: null,
    email: null,
  })
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserStats()
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      // Por ahora, obtener el primer usuario o crear uno por defecto
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (error) throw error

      if (users && users.length > 0) {
        setUser({
          name: users[0].name || 'Usuario',
          photo_url: users[0].photo_url || users[0].avatar_url,
          email: users[0].email,
        })
        form.setFieldsValue({
          name: users[0].name || 'Usuario',
          email: users[0].email,
        })
      } else {
        // Crear usuario por defecto si no existe
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ name: 'Usuario', email: null }])
          .select()
          .single()

        if (createError) throw createError

        if (newUser) {
          setUser({
            name: newUser.name,
            photo_url: newUser.photo_url,
            email: newUser.email,
          })
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const handleEditProfile = () => {
    setIsEditModalVisible(true)
  }

  const handleSaveProfile = async (values) => {
    try {
      // Obtener el usuario actual
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (users && users.length > 0) {
        const { error } = await supabase
          .from('users')
          .update({
            name: values.name,
            email: values.email,
          })
          .eq('id', users[0].id)

        if (error) throw error

        setUser({
          ...user,
          name: values.name,
          email: values.email,
        })
        message.success('Perfil actualizado correctamente')
        setIsEditModalVisible(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      message.error('Error al actualizar el perfil')
    }
  }

  const loadUserStats = async () => {
    try {
      // Obtener usuario actual
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (currentUser && currentUser.length > 0) {
        setUser({
          name: currentUser[0].name || 'Usuario',
          photo_url: currentUser[0].photo_url || currentUser[0].avatar_url,
          email: currentUser[0].email,
        })
        form.setFieldsValue({
          name: currentUser[0].name || 'Usuario',
          email: currentUser[0].email,
        })
      }

      // Cargar estadísticas
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')

      if (error) throw error

      const completed = tasks?.filter(t => t.status === 'completed').length || 0
      const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0
      const totalPoints = currentUser && currentUser.length > 0 ? (currentUser[0].total_points || 0) : 0
      const totalTasks = tasks?.length || 0

      // Obtener ranking
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })

      const currentUserName = currentUser && currentUser.length > 0 ? currentUser[0].name : null
      const rank = currentUserName ? users?.findIndex(u => u.name === currentUserName) + 1 || 0 : 0

      setUserStats({
        totalPoints,
        completedTasks: completed,
        inProgressTasks: inProgress,
        totalTasks,
        rank: rank || 0,
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const userTitle = userStats.totalPoints > 1000 ? 'MASTER' : 
                   userStats.totalPoints > 500 ? 'EXPERT' : 
                   userStats.totalPoints > 200 ? 'PRO' : 'NOVATO'

  const nextLevelPoints = 1000
  const currentLevel = Math.floor(userStats.totalPoints / 200) + 1
  const progressToNextLevel = (userStats.totalPoints % 200) / 200 * 100

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-top">
          <SettingOutlined style={{ fontSize: 24, color: '#ECEFFF', cursor: 'pointer' }} />
          <BellOutlined style={{ fontSize: 24, color: '#ECEFFF', cursor: 'pointer' }} />
        </div>

        <div className="profile-banner">
          <div className="profile-avatar-container">
            <div style={{ position: 'relative' }}>
              <Avatar
                size={120}
                src={user.photo_url}
                style={{
                  background: user.photo_url ? 'transparent' : 'linear-gradient(135deg, #492AAC 0%, #5a3bc4 100%)',
                  border: '4px solid #492AAC',
                  boxShadow: '0 0 20px rgba(73, 42, 172, 0.5)',
                }}
              >
                {!user.photo_url && user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={handleEditProfile}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  border: '2px solid #0C083A',
                }}
              />
            </div>
          </div>
          <Title level={2} style={{ color: '#ECEFFF', margin: '16px 0 8px 0', textAlign: 'center', fontWeight: 700 }}>
            {user.name.toUpperCase()}
          </Title>
          <Tag color="purple" style={{ fontSize: 16, padding: '4px 16px' }}>
            {userTitle}
          </Tag>
        </div>
      </div>

      <div className="profile-content">
        {/* Level Progress */}
        <Card className="glass-card" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#ECEFFF', opacity: 0.9, fontWeight: 600 }}>
              Nivel {currentLevel}
            </Text>
            <Text strong style={{ color: '#ECEFFF', float: 'right', fontWeight: 700 }}>
              Nivel {currentLevel + 1}
            </Text>
          </div>
          <Progress
            percent={progressToNextLevel}
            strokeColor={{
              '0%': '#492AAC',
              '100%': '#52c41a',
            }}
            trailColor="rgba(236, 239, 255, 0.2)"
            size="large"
          />
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <FireOutlined style={{ color: '#faad14', marginRight: 4 }} />
            <Text strong style={{ color: '#ECEFFF' }}>
              {userStats.totalPoints} XP
            </Text>
          </div>
        </Card>

        {/* Stats - Movidas del Dashboard */}
        <Card className="glass-card" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ color: '#ECEFFF', marginBottom: 16, fontWeight: 700 }}>
            Estadísticas
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={8} sm={8}>
              <div className="stat-card">
                <Statistic
                  title="Completadas"
                  value={userStats.completedTasks}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#ECEFFF' }}
                />
              </div>
            </Col>
            <Col xs={8} sm={8}>
              <div className="stat-card">
                <Statistic
                  title="En Progreso"
                  value={userStats.inProgressTasks}
                  prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#ECEFFF' }}
                />
              </div>
            </Col>
            <Col xs={8} sm={8}>
              <div className="stat-card">
                <Statistic
                  title="Ranking"
                  value={userStats.rank || 'N/A'}
                  prefix={<TrophyOutlined style={{ color: '#492AAC' }} />}
                  valueStyle={{ color: '#ECEFFF' }}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Progress Section */}
        <Card className="glass-card" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ color: '#ECEFFF', marginBottom: 16, fontWeight: 700 }}>
            Progreso General
          </Title>
          <Progress
            percent={userStats.totalTasks > 0 ? Math.round((userStats.completedTasks / userStats.totalTasks) * 100) : 0}
            strokeColor={{
              '0%': '#492AAC',
              '100%': '#52c41a',
            }}
            trailColor="rgba(236, 239, 255, 0.2)"
            size="large"
          />
          <Text strong style={{ color: '#ECEFFF', marginTop: 8, display: 'block', opacity: 0.9, fontWeight: 600 }}>
            {userStats.completedTasks} de {userStats.totalTasks} tareas completadas
          </Text>
        </Card>

        {/* Achievements */}
        <Card className="glass-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ color: '#ECEFFF', margin: 0, fontWeight: 700 }}>
              Logros
            </Title>
            <Text strong style={{ color: '#ECEFFF', cursor: 'pointer', fontWeight: 600, opacity: 0.9 }}>
              Ver todos
            </Text>
          </div>
          <div className="achievements-grid">
            {[
              { icon: '🏆', name: 'Primera Tarea', unlocked: true },
              { icon: '🔥', name: 'Racha de 5', unlocked: userStats.completedTasks >= 5 },
              { icon: '⭐', name: '100 Puntos', unlocked: userStats.totalPoints >= 100 },
              { icon: '👑', name: 'Top 10', unlocked: userStats.rank <= 10 && userStats.rank > 0 },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <Text style={{ fontSize: 12, color: achievement.unlocked ? '#ECEFFF' : 'rgba(236, 239, 255, 0.3)' }}>
                  {achievement.name}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance */}
        <Card className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ color: '#ECEFFF', margin: 0, fontWeight: 700 }}>
              Mi Rendimiento
            </Title>
            <Text strong style={{ color: '#ECEFFF', fontSize: 12, opacity: 0.9, fontWeight: 600 }}>
              Comparado con otros usuarios
            </Text>
          </div>
          <div style={{ marginTop: 16 }}>
            <Progress
              percent={userStats.rank > 0 ? Math.max(100 - (userStats.rank * 10), 10) : 50}
              strokeColor={{
                '0%': '#ff4d4f',
                '50%': '#faad14',
                '100%': '#52c41a',
              }}
              trailColor="rgba(236, 239, 255, 0.2)"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <Text strong style={{ color: '#ECEFFF', fontSize: 12, opacity: 0.9, fontWeight: 600 }}>Bajo</Text>
              <Text strong style={{ color: '#ECEFFF', fontSize: 12, opacity: 0.9, fontWeight: 600 }}>¡Excelente!</Text>
            </div>
            {userStats.rank > 0 && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Tag color="success" style={{ fontSize: 14 }}>
                  TOP {Math.max(100 - userStats.rank, 1)}%
                </Tag>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de edición de perfil */}
      <Modal
        title="Editar Perfil"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 400 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
          >
            <Input placeholder="Tu nombre" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input type="email" placeholder="tu@email.com" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Guardar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile

