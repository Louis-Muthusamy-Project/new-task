import React from 'react';
import { Layout, Input, Button, Avatar, Badge, Dropdown, Grid } from 'antd';
import { Search, Bell, Sun, Moon, User, Command, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLayoutContext } from '../contexts/LayoutContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { role, logout } = useAuth();
  const { toggleMobileMenu } = useLayoutContext();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const userMenuItems = [
    { key: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { type: 'divider' },
    { key: 'logout', label: 'Logout', danger: true, icon: <LogOut size={16} />, onClick: logout },
  ];

  const getUserDetails = () => {
    if (role === 'agency') return { name: 'Arjun Sharma', subtitle: 'BCC Martech', initial: 'AS' };
    if (role === 'client') return { name: 'Rahul Kapoor', subtitle: 'Prestige Estates', initial: 'RK' };
    if (role === 'superadmin') return { name: 'Super Admin', subtitle: 'Platform Owner', initial: 'SA' };
    return { name: 'Admin User', subtitle: 'Agency Owner', initial: 'AU' };
  };

  const userDetails = getUserDetails();

  return (
    <AntHeader style={{  
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
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: screens.lg ? 0 : 16 }}>
        {!screens.lg && (
          <Button 
            type="text" 
            icon={<MenuIcon size={20} />} 
            onClick={toggleMobileMenu}
            style={{ color: 'var(--text-primary)', padding: '0 8px', marginLeft: -12 }}
          />
        )}
        <Input 
          prefix={<Search size={16} style={{ color: 'var(--text-tertiary)' }} />} 
          placeholder="Search clients, leads, tasks..." 
          style={{ 
            maxWidth: screens.lg ? 400 : '100%', 
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
        {role === 'superadmin' && !location.pathname.startsWith('/superadmin') && (
          <Button 
            type="primary" 
            onClick={() => navigate('/superadmin/dashboard')}
            style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
          >
            Back to Super Admin
          </Button>
        )}
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
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{userDetails.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{userDetails.subtitle}</span>
            </div>
            <Avatar style={{ backgroundColor: 'var(--accent-primary)', fontWeight: 800 }}>{userDetails.initial}</Avatar>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
