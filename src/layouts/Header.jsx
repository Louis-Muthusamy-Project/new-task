import React from 'react';
import { Layout, Input, Button, Avatar, Badge, Dropdown } from 'antd';
import { Search, Bell, Sun, Moon, User, Command } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const { Header: AntHeader } = Layout;

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  const userMenuItems = [
    { key: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { type: 'divider' },
    { key: 'logout', label: 'Logout', danger: true },
  ];

  return (
    <AntHeader style={{ 
      padding: '0 24px', 
      background: 'var(--bg-secondary)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: 64,
      lineHeight: '64px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Input 
          prefix={<Search size={16} style={{ color: 'var(--text-tertiary)' }} />} 
          placeholder="Search clients, leads, tasks..." 
          style={{ 
            maxWidth: 400, 
            borderRadius: 8,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)'
          }}
          suffix={
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>
              <Command size={12} /> K
            </div>
          }
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button 
          type="text" 
          icon={isDark ? <Sun size={20} /> : <Moon size={20} />} 
          onClick={toggleTheme}
          style={{ color: 'var(--text-secondary)' }}
        />
        
        <Badge count={3} dot>
          <Button 
            type="text" 
            icon={<Bell size={20} />} 
            style={{ color: 'var(--text-secondary)' }}
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.3s' }} className="hover-bg">
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'right' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Admin User</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Agency Owner</span>
            </div>
            <Avatar style={{ backgroundColor: 'var(--accent-primary)' }} icon={<User size={18} />} />
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
