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
import ProductsAdmin from './pages/admin/Trending_admin.jsx'
import AdminBestSelling from './pages/admin/Best_products_admin.jsx'
import AdminJustArrived from './pages/admin/Just_arrived_admin.jsx'
import AdminRecentBlog from './pages/admin/Recent_blog_admin.jsx'

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
          },
          {
            path:"Products",
            element:<ProductsAdmin />
          },
          {
            path:"selling",
            element:<AdminBestSelling/>
          },
          {
            path:"just",
            element:<AdminJustArrived/>
          },
          {
            path:"recent",
            element:<AdminRecentBlog/>
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
