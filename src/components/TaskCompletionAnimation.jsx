import { useEffect, useState } from 'react'
import { CheckCircleOutlined } from '@ant-design/icons'
import './TaskCompletionAnimation.css'

const TaskCompletionAnimation = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
      if (onComplete) {
        setTimeout(onComplete, 300)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isAnimating) return null

  return (
    <div className="completion-overlay">
      <div className="completion-content">
        <div className="completion-check">
          <CheckCircleOutlined />
        </div>
        <div className="completion-text">¡Tarea Completada!</div>
        <div className="completion-particles">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--delay': `${i * 0.1}s`,
                '--angle': `${(360 / 12) * i}deg`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaskCompletionAnimation

