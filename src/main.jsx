import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Admin from './pages/admin/index.jsx'
import Layout from './pages/admin/Layout.jsx'
// import { Layout } from 'lucide-react'


const routes = createBrowserRouter([
  {
    path:"",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <App />
      }
      ,{
      path: "/admin",
      element: <Admin />
    }]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <RouterProvider router={routes} />
  </StrictMode>,
)
