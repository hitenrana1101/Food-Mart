import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Admin from './pages/admin/index.jsx'
import Layout from './pages/admin/Layout.jsx'
import UserProfilePage from './pages/admin/User_profile.jsx'
import WelcomeBannerPage from './pages/admin/Welcome_banner.jsx'
import Categorypage from './pages/admin/Admin_category.jsx'
import Newarrived from './pages/admin/New_arrived_admin.jsx'

const routes = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <App />
      }
      , {
        path: "/admin",
        element: <Admin />,
        children: [
          {
            path: "",
            element: <UserProfilePage />
          },
          {
            path: "welcome",
            element: <WelcomeBannerPage />
          },
          {
            path: "category",
            element: <Categorypage />
          },
          {
            path:"Promises",
            element:<Newarrived />
          }
        ]
      }]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={routes} />
  </StrictMode>,
)
