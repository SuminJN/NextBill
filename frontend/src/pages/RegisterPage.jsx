import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 회원가입 페이지는 더 이상 사용하지 않음
    // Google OAuth2 로그인 페이지로 리디렉션
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default RegisterPage;
