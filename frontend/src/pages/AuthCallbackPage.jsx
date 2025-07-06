import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessMessage, showErrorMessage } from '../api';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const isNewUser = searchParams.get('isNewUser') === 'true';
      
      // 중복 처리 방지: URL 파라미터를 키로 사용
      const processKey = `auth_processed_${token?.slice(0, 10)}`;
      if (sessionStorage.getItem(processKey)) {
        return; // 이미 처리됨
      }

      if (token && refreshToken) {
        // 처리 시작 표시
        sessionStorage.setItem(processKey, 'true');
        
        try {
          await loginWithToken(token, refreshToken);
          
          if (isNewUser) {
            showSuccessMessage('추가 정보를 입력해주세요.');
            navigate('/complete-registration');
          } else {
            showSuccessMessage('로그인되었습니다.');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Token 저장 실패:', error);
          showErrorMessage('로그인 처리 중 오류가 발생했습니다.');
          sessionStorage.removeItem(processKey); // 실패 시 키 제거
          navigate('/login');
        }
      } else {
        showErrorMessage('로그인에 실패했습니다.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
      }}
    >
      <CircularProgress size={60} sx={{ color: '#6366f1', mb: 3 }} />
      <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
        로그인 처리 중...
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
        잠시만 기다려주세요.
      </Typography>
    </Box>
  );
};

export default AuthCallbackPage;
