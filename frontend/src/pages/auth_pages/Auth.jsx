import { useState } from 'react'
import Login from './Login'
import Register from './Register'

export default function Auth() {

    const [mode, setMode] = useState('login')
      return (
    <>
    {
        mode === 'login' ? (
            <Login switchToRegister={() => setMode('register')} />
        ) : (
            <Register switchToLogin={() => setMode('login')} />
        )
        
    }
    </>
  )
}
