import React from 'react'
import { BrowserRouter, Outlet, Routes } from 'react-router-dom'
import TopNav from "../admin/TopNav"
import Sidebar from './Sidebar'

const index = () => {
  return (
    <div>
      <TopNav />
      <div className='flex'>
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}

export default index