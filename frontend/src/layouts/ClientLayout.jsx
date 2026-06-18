import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import Header from './Header';

const { Content } = Layout;

const ClientLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <ClientSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout style={{ background: 'var(--bg-primary)' }}>
        <Header />
        <Content style={{ 
          margin: '24px 24px 0', 
          overflow: 'initial',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1, paddingBottom: 24 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClientLayout;
