import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  FormOutlined,
  HistoryOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './styles/App.css';

// 页面组件将在后续创建
import Home from './pages/Home';
import CreateContent from './pages/CreateContent';
import ContentHistory from './pages/ContentHistory';
import Profile from './pages/Profile';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/create',
      icon: <FormOutlined />,
      label: <Link to="/create">创建内容</Link>,
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">历史记录</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">AI教具</div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['/']}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateContent />} />
              <Route path="/history" element={<ContentHistory />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          AI教具 ©{new Date().getFullYear()} Created by AI Team
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;