import { useState, useEffect } from 'react'
import { Card, Avatar, Typography, Tag, Progress } from 'antd'
import { TrophyOutlined, CrownOutlined, FireOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import './Ranking.css'

const { Title, Text } = Typography

const Ranking = () => {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadRankings()
  }, [])

  const loadRankings = async () => {
    try {
      // Cargar usuarios con sus puntos
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })

      if (error) throw error

      // Calcular puntos desde tareas completadas si no hay en users
      if (!users || users.length === 0) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('assigned_to, points, status')
          .eq('status', 'completed')

        // Agrupar por usuario
        const pointsByUser = {}
        tasks?.forEach(task => {
          if (task.assigned_to) {
            pointsByUser[task.assigned_to] = (pointsByUser[task.assigned_to] || 0) + (task.points || 0)
          }
        })

        const rankingsData = Object.entries(pointsByUser)
          .map(([name, points]) => ({
            name,
            total_points: points,
            avatar: null,
          }))
          .sort((a, b) => b.total_points - a.total_points)
          .map((user, index) => ({
            ...user,
            rank: index + 1,
          }))

        setRankings(rankingsData)
      } else {
        const rankingsData = users.map((user, index) => ({
          ...user,
          rank: index + 1,
        }))
        setRankings(rankingsData)
      }
    } catch (error) {
      console.error('Error loading rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#FFD700', fontSize: 24 }} />
    if (rank === 2) return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 20 }} />
    if (rank === 3) return <TrophyOutlined style={{ color: '#CD7F32', fontSize: 18 }} />
    return null
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'
    if (rank === 2) return '#C0C0C0'
    if (rank === 3) return '#CD7F32'
    return '#492AAC'
  }

  const topThree = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  const maxPoints = rankings.length > 0 ? rankings[0].total_points : 1

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <Title level={2} style={{ color: '#ECEFFF', margin: 0, fontWeight: 700 }}>
          Ranking
        </Title>
        <Text strong style={{ color: '#ECEFFF', opacity: 0.9, fontWeight: 600 }}>
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </Text>
      </div>

      {rankings.length === 0 ? (
        <Card className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <Text style={{ color: 'rgba(236, 239, 255, 0.5)' }}>
            Aún no hay rankings. ¡Completa tareas para ganar puntos!
          </Text>
        </Card>
      ) : (
        <>
          {/* Top 3 */}
          {topThree.length > 0 && (
            <div className="top-three">
              {topThree.map((user, index) => {
                const position = index + 1
                const isCenter = position === 1
                return (
                  <Card
                    key={user.id || user.name}
                    className={`glass-card podium-card ${isCenter ? 'center' : ''}`}
                    style={{
                      border: `2px solid ${getRankColor(position)}`,
                      background: `linear-gradient(135deg, rgba(73, 42, 172, 0.3) 0%, rgba(69, 67, 104, 0.6) 100%)`,
                    }}
                  >
                    <div className="podium-content">
                      <div className="rank-badge" style={{ background: getRankColor(position) }}>
                        {getRankIcon(position)}
                        <Text strong style={{ color: '#ECEFFF', fontSize: 16 }}>
                          {position}º
                        </Text>
                      </div>
                      <Avatar
                        size={isCenter ? 80 : 60}
                        style={{
                          background: getRankColor(position),
                          border: `3px solid ${getRankColor(position)}`,
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Title level={4} style={{ color: '#ECEFFF', margin: '8px 0 4px 0', fontWeight: 700 }}>
                        {user.name}
                      </Title>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FireOutlined style={{ color: '#faad14' }} />
                        <Text strong style={{ color: '#ECEFFF', fontSize: 18, fontWeight: 700 }}>
                          {user.total_points || 0} XP
                        </Text>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Rest of rankings */}
          {rest.length > 0 && (
            <div className="rest-rankings">
              <Title level={4} style={{ color: '#ECEFFF', marginBottom: 16, fontWeight: 700 }}>
                Resto del Ranking
              </Title>
              {rest.map((user) => (
                <Card
                  key={user.id || user.name}
                  className="glass-card ranking-item"
                  style={{ marginBottom: 12 }}
                >
                  <div className="ranking-item-content">
                    <div className="ranking-left">
                      <Text strong style={{ color: '#ECEFFF', fontSize: 18, minWidth: 40, fontWeight: 700 }}>
                        #{user.rank}
                      </Text>
                      <Avatar
                        size={50}
                        style={{ background: '#492AAC' }}
                      >
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <div className="ranking-info">
                        <Text strong style={{ color: '#ECEFFF', fontSize: 16, fontWeight: 700 }}>
                          {user.name}
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <FireOutlined style={{ color: '#faad14', fontSize: 12 }} />
                          <Text strong style={{ color: '#ECEFFF', fontSize: 14, opacity: 0.9, fontWeight: 600 }}>
                            {user.total_points || 0} XP
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div className="ranking-progress">
                      <Progress
                        percent={Math.round((user.total_points / maxPoints) * 100)}
                        strokeColor={{
                          '0%': '#492AAC',
                          '100%': '#52c41a',
                        }}
                        trailColor="rgba(236, 239, 255, 0.2)"
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Ranking

