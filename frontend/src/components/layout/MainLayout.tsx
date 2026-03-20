import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Dropdown, Avatar, Space, Spin } from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  TableOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { MenuItem } from '../../services/auth';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SearchOutlined: <SearchOutlined />,
  TableOutlined: <TableOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
};

// 转换后端菜单数据为 Ant Design Menu 格式
const convertToMenuItems = (menus: MenuItem[]): { key: string; icon?: React.ReactNode; label: string; children?: any[] }[] => {
  return menus.map((menu) => ({
    key: menu.path,
    icon: menu.icon ? iconMap[menu.icon] || <UnorderedListOutlined /> : undefined,
    label: menu.name,
    children: menu.children && menu.children.length > 0
      ? convertToMenuItems(menu.children)
      : undefined,
  }));
};

// 静态默认菜单（未登录时显示）
const defaultMenuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '首页' },
  { key: '/query', icon: <SearchOutlined />, label: 'AI 查询' },
  {
    key: '/admin',
    icon: <SafetyOutlined />,
    label: '权限管理',
    children: [
      { key: '/admin/users', label: '用户管理' },
      { key: '/admin/roles', label: '角色管理' },
      { key: '/admin/menus', label: '菜单管理' },
    ],
  },
  { key: '/explorer', icon: <TableOutlined />, label: '数据探索' },
  { key: '/reports', icon: <BarChartOutlined />, label: '报表' },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { menus, isLoading, loadMenus, clearMenus } = useMenuStore();

  // 登录后加载菜单
  useEffect(() => {
    if (isAuthenticated) {
      loadMenus();
    } else {
      clearMenus();
    }
  }, [isAuthenticated, loadMenus, clearMenus]);

  const handleLogout = async () => {
    await logout();
    clearMenus();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 根据是否有菜单数据决定使用动态还是静态菜单
  const menuItems = menus.length > 0 ? convertToMenuItems(menus) : defaultMenuItems;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            padding: collapsed ? '16px 8px' : '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Title
            level={collapsed ? 5 : 4}
            style={{ margin: 0, whiteSpace: 'nowrap' }}
          >
            {collapsed ? 'ERP' : 'ERP 查询智能体'}
          </Title>
        </div>
        <Spin spinning={isLoading} tip="加载菜单...">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, minHeight: 'calc(100vh - 64px)' }}
          />
        </Spin>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Space size="middle">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.username || '用户'}</span>
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{ padding: '24px', background: '#fafafa', minHeight: 'calc(100vh - 64px)' }}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '8px',
              minHeight: '100%',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
