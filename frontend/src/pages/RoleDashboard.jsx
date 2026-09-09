import React from 'react'

import { getUserRole } from '@/utils/auth'

import DispatcherDashboard from './DispatcherDashboard/DispatcherDashboard'
import RiderDashboard from './RiderDashboard/RiderDashboard'
import RetailerDashboard from './RetaillerDashboard/RetaillerDashboard'
import { Navigate } from 'react-router-dom'

export default function RoleDashboard() {

    const userRole = getUserRole()

    if (!userRole){
        <Navigate to='/' replace />
    }

  switch(userRole){
    case 'retailer':
        return <RetailerDashboard/>;
    case 'dispatcher':
        return <DispatcherDashboard/>;
    case 'rider':
        return <RiderDashboard/>;
    default:
        return <Navigate to='/'/>
  }
}
