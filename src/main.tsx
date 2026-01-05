import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';

// 페이지 및 레이아웃 임포트
import AdminLayout from '@/pages/layout/AdminLayout';
import DashboardPage from '@/pages/board/DashboardPage';


// 라우터 구성
const router = createBrowserRouter([

    {
        path: '/',
        element: <AdminLayout />, // 사이드바가 포함된 공통 레이아웃
        children: [
            {
                path: 'dashboard',
                element: <DashboardPage />
            },

            // 기본 경로(/) 접속 시 대시보드로 리다이렉트
            {
                index: true,
                element: <Navigate to="/dashboard" replace />
            }
        ]
    },
    // 정의되지 않은 모든 경로는 대시보드로
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
