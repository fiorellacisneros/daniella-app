import { useNavigate, useLocation } from 'react-router-dom'
import { HomeOutlined, CheckSquareOutlined, CalendarOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons'
import './BottomNavigation.css'

const BottomNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Inicio',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendario',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Tareas',
    },
    {
      key: '/ranking',
      icon: <TrophyOutlined />,
      label: 'Ranking',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
  ]

  return (
    <div className="bottom-navigation">
      {items.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${location.pathname === item.key ? 'active' : ''}`}
          onClick={() => navigate(item.key)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default BottomNavigation

