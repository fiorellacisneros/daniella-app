import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import './Login.css'

const { Title, Text } = Typography
const { TabPane } = Tabs

const Login = ({ onLoginSuccess }) => {
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) throw error

      // Verificar si el usuario existe en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', values.email)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        // Si no existe, crear el usuario
        const { error: createError } = await supabase
          .from('users')
          .insert([{
            email: values.email,
            name: values.email.split('@')[0], // Usar parte del email como nombre
            total_points: 0,
          }])

        if (createError) throw createError
      }

      message.success('¡Bienvenido!')
      onLoginSuccess()
    } catch (error) {
      console.error('Error logging in:', error)
      message.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      // Registrar en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (authError) throw authError

      // Crear usuario en la tabla users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          email: values.email,
          name: values.name,
          total_points: 0,
        }])

      if (userError) throw userError

      message.success('¡Cuenta creada! Revisa tu email para confirmar.')
      onLoginSuccess()
    } catch (error) {
      console.error('Error registering:', error)
      message.error(error.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <Title level={2} style={{ color: '#ECEFFF', textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>
            Daniella App
          </Title>
          <Text strong style={{ color: '#ECEFFF', textAlign: 'center', display: 'block', opacity: 0.9, fontWeight: 600 }}>
            Gestiona tus tareas y gana premios juntos
          </Text>
        </div>

        <Card className="glass-card login-card">
          <Tabs defaultActiveKey="login" centered>
            <TabPane tab="Iniciar Sesión" key="login">
              <Form
                form={loginForm}
                layout="vertical"
                onFinish={handleLogin}
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Ingresa tu email' },
                    { type: 'email', message: 'Email inválido' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    style={{ background: 'rgba(69, 67, 104, 0.4)' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Contraseña"
                    style={{ background: 'rgba(69, 67, 104, 0.4)' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    size="large"
                    style={{
                      background: '#ECEFFF',
                      borderColor: '#ECEFFF',
                      color: '#0C083A',
                      fontWeight: 700,
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Registrarse" key="register">
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegister}
                size="large"
              >
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Ingresa tu nombre' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nombre"
                    style={{ background: 'rgba(69, 67, 104, 0.4)' }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Ingresa tu email' },
                    { type: 'email', message: 'Email inválido' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    style={{ background: 'rgba(69, 67, 104, 0.4)' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Ingresa una contraseña' },
                    { min: 6, message: 'Mínimo 6 caracteres' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Contraseña"
                    style={{ background: 'rgba(69, 67, 104, 0.4)' }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  rules={[
                    { required: true, message: 'Confirma tu contraseña' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('Las contraseñas no coinciden'))
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirmar contraseña"
                    style={{ background: 'rgba(69, 67, 104, 0.4)' }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    size="large"
                    style={{
                      background: '#ECEFFF',
                      borderColor: '#ECEFFF',
                      color: '#0C083A',
                      fontWeight: 700,
                    }}
                  >
                    Crear Cuenta
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default Login

