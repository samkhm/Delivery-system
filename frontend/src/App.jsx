import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/auth_pages/Auth'
import RoleDashboard from './pages/RoleDashboard'
import ProtectedRoutes from './utils/ProtectedRoutes'
// import RetailerDashboard from './pages/RetaillerDashboard/RetaillerDashboard'

export default function App() {
  return (   
    <BrowserRouter>
     <Routes>
       <Route path='/' element={<Auth/>} />
       <Route path='/login' element={<Auth/>}/>
       <Route path='/register' element={<Auth/>} />
       <Route path='/dashboard' element={
        <ProtectedRoutes>
          <RoleDashboard/>
        </ProtectedRoutes>
       } />
     </Routes>
    </BrowserRouter>
  )
}
