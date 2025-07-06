import React from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Google as GoogleIcon, DarkMode, LightMode } from '@mui/icons-material';
import Footer from '../components/Footer/Footer';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

const LoginPage = () => {
  const theme = useTheme();
  const { isDarkMode, toggleDarkMode } = useAppTheme();

  const handleGoogleLogin = () => {
    // Google OAuth2 로그인 URL로 리디렉션
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(30, 32, 44, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 다크모드 토글 버튼 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Tooltip title={isDarkMode ? '라이트 모드로 변경' : '다크 모드로 변경'}>
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            {isDarkMode ? (
              <LightMode sx={{ color: 'orange' }} />
            ) : (
              <DarkMode sx={{ color: 'navy' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={isDarkMode ? 0 : 10}
          sx={{
            p: 6,
            width: '100%',
            backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.3)' : 'none',
          }}
        >
          {/* 로고 및 제목 */}
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              NextBill
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              구독 서비스 관리의 새로운 경험
            </Typography>
          </Box>

          {/* 설명 */}
          <Box textAlign="center" mb={4}>
            <Typography variant="body1" color="text.secondary" mb={2}>
              Google 계정으로 간편하게 시작하세요
            </Typography>
            <Typography variant="body2" color="text.secondary">
              구독 서비스 관리와 결제일 알림을 한 곳에서
            </Typography>
          </Box>

          {/* Google 로그인 버튼 */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #ea4335 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient 3s ease infinite',
              '&:hover': {
                background: 'linear-gradient(135deg, #3367d6 0%, #2d8f47 50%, #d33b2c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(66, 133, 244, 0.3)',
              },
              transition: 'all 0.3s ease',
              '@keyframes gradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
            }}
          >
            Google로 계속하기
          </Button>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default LoginPage;
