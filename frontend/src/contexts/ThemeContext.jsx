import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  const antdConfig = {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      fontFamily: `'Plus Jakarta Sans', sans-serif`,
      fontSize: 16,
      colorPrimary: '#3b82f6',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      borderRadius: 8,
    },
    components: {
      Typography: {
        fontWeightStrong: 800,
      },
      Card: {
        colorBgContainer: isDark ? '#1e293b' : '#ffffff',
        colorBorderSecondary: isDark ? '#334155' : '#e2e8f0',
      },
      Menu: {
        itemBg: 'transparent',
      },
      Layout: {
        headerBg: isDark ? '#1e293b' : '#ffffff',
        bodyBg: isDark ? '#0f172a' : '#f4f7fb',
      }
    }
  };


  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      <ConfigProvider theme={antdConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
