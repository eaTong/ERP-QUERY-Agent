import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Query from './pages/Query';
import DataExplorer from './pages/DataExplorer';
import Reports from './pages/Reports';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import UserManage from './pages/admin/UserManage';
import RoleManage from './pages/admin/RoleManage';
import MenuManage from './pages/admin/MenuManage';
import DataSourceManage from './pages/datasource/DataSourceManage';
import TableMappingManage from './pages/datasource/TableMappingManage';
import PromptRuleManage from './pages/datasource/PromptRuleManage';
import { useAuthStore } from './stores/authStore';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="query" element={<Query />} />
            <Route path="explorer" element={<DataExplorer />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin/users" element={<UserManage />} />
            <Route path="admin/roles" element={<RoleManage />} />
            <Route path="admin/menus" element={<MenuManage />} />
            <Route path="datasource/list" element={<DataSourceManage />} />
            <Route path="datasource/mappings" element={<TableMappingManage />} />
            <Route path="datasource/prompts" element={<PromptRuleManage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
