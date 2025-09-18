// routes.jsx
// import { Suspense, lazy } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './auth'; // returns { user, roles }


// const AdminHome = lazy(() => import('./pages/admin/index.jsx'));

// const RequireAdmin = ({ children }) => {
//   const { user, roles } = useAuth();
//   const isAdmin = user && roles?.includes('admin');
//   return isAdmin ? children : <Navigate to="/" replace />;
// };

export default function AppRoutes() {
  return (
    <p>hi</p>
    // <Suspense fallback={<div>Loading...</div>}>
    //   <Routes>
    //     <Route path="/" element={<Index />} />
    //     <Route
    //       path="/admin/*"
    //       element={
    //         <RequireAdmin>
    //           <AdminHome />
    //         </RequireAdmin>
    //       }
    //     />
    //   </Routes>
    // </Suspense>
  );
}
