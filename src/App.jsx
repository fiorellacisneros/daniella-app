import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Tasks from './pages/Tasks'
import Ranking from './pages/Ranking'
import Profile from './pages/Profile'
import Login from './pages/Login'
import BottomNavigation from './components/BottomNavigation'
import Onboarding from './components/Onboarding'
import { supabase } from './lib/supabase'
import './App.css'

const { Content } = Layout

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setShowLogin(false)
        checkOnboardingStatus()
      } else {
        setShowLogin(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        checkOnboardingStatus()
      } else {
        setShowLogin(true)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setShowLogin(true)
    } finally {
      setLoading(false)
    }
  }

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .limit(1)

      if (error) {
        console.error('Error checking users:', error)
        setShowOnboarding(true)
      } else {
        // Si no hay usuario en la tabla, mostrar onboarding
        setShowOnboarding(!users || users.length === 0)
      }
    } catch (error) {
      console.error('Error:', error)
      setShowOnboarding(true)
    }
  }

  const handleLoginSuccess = () => {
    setShowLogin(false)
    checkOnboardingStatus()
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0C083A',
        color: '#ECEFFF'
      }}>
        Cargando...
      </div>
    )
  }

  if (showLogin) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <Router>
      <div className="app-container">
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
          <Content style={{ paddingBottom: '70px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Content>
          <BottomNavigation />
        </Layout>
      </div>
    </Router>
  )
}

export default App

