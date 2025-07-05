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
  FormControlLabel,
  Switch,
  useTheme,
} from '@mui/material';
import { userAPI, handleApiError, showSuccessMessage } from '../api';
import Footer from '../components/Footer/Footer';

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    isEmailAlertEnabled: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 형식이 아닙니다.';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 4) {
      newErrors.password = '비밀번호는 4자 이상이어야 합니다.';
    } else if (formData.password.length > 20) {
      newErrors.password = '비밀번호는 20자 이하이어야 합니다.';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      // 이메일 중복 확인
      const emailExists = await userAPI.checkEmail(formData.email);
      if (emailExists) {
        setErrors({ email: '이미 사용 중인 이메일입니다.' });
        setIsLoading(false);
        return;
      }

      // 회원가입
      await userAPI.register({
        email: formData.email,
        password: formData.password,
        isEmailAlertEnabled: formData.isEmailAlertEnabled,
      });

      showSuccessMessage('회원가입이 완료되었습니다!');
      navigate('/login');
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
              새로운 계정을 만들어보세요
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
              회원가입
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="이메일"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
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
                name="password"
                label="비밀번호"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
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
                name="confirmPassword"
                label="비밀번호 확인"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
              
              <Box 
                sx={{ 
                  mt: 2, 
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isEmailAlertEnabled}
                      onChange={handleChange}
                      name="isEmailAlertEnabled"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        이메일 알림 받기
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        구독 갱신 알림을 이메일로 받아보세요
                      </Typography>
                    </Box>
                  }
                />
              </Box>
              
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
                    가입 처리 중...
                  </Box>
                ) : (
                  '회원가입'
                )}
              </Button>
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  이미 계정이 있으신가요?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#6366f1', 
                      fontWeight: 600,
                    }}
                  >
                    로그인
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

export default RegisterPage;
