import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { handleApiError, showSuccessMessage } from '../api';
import Footer from '../components/Footer/Footer';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userEmail) {
      newErrors.userEmail = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = '유효한 이메일 형식이 아닙니다.';
    }
    
    if (!formData.userPassword) {
      newErrors.userPassword = '비밀번호를 입력해주세요.';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);
      showSuccessMessage('로그인 성공!');
      navigate('/dashboard');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* 로고와 헤더 */}
          <Box
            sx={{
              mb: 4,
              textAlign: 'center',
              '& > *': {
                animation: 'fadeInUp 0.6s ease-out',
              },
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 auto 24px',
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
              }}
            >
              N
            </Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              NextBill
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              구독 서비스를 스마트하게 관리하세요
            </Typography>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              padding: { xs: 3, sm: 4 }, 
              width: '100%',
              borderRadius: 3,
              boxShadow: isDarkMode 
                ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
                : '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: isDarkMode 
                ? '1px solid rgba(51, 65, 85, 0.6)' 
                : '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: isDarkMode 
                ? theme.palette.background.paper 
                : '#ffffff',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              로그인
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="userEmail"
                label="이메일"
                name="userEmail"
                autoComplete="email"
                autoFocus
                value={formData.userEmail}
                onChange={handleChange}
                error={!!errors.userEmail}
                helperText={errors.userEmail}
                disabled={isLoading}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="userPassword"
                label="비밀번호"
                type="password"
                id="userPassword"
                autoComplete="current-password"
                value={formData.userPassword}
                onChange={handleChange}
                error={!!errors.userPassword}
                helperText={errors.userPassword}
                disabled={isLoading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  mt: 2, 
                  mb: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    로그인 중...
                  </Box>
                ) : (
                  '로그인'
                )}
              </Button>
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  계정이 없으신가요?{' '}
                  <Link 
                    to="/register" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#6366f1', 
                      fontWeight: 600,
                    }}
                  >
                    회원가입
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default LoginPage;
