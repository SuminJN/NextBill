import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  // localStorage에서 다크모드 설정 불러오기 (기본값: 라이트 모드)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nextbill_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // 다크모드 설정이 변경될 때 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('nextbill_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // 현재 모드에 따른 테마 생성
  const theme = createAppTheme(isDarkMode ? 'dark' : 'light');

  const value = {
    isDarkMode,
    toggleDarkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
