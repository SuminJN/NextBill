import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

// 초기 상태
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

// 액션 타입
const AuthActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

// 리듀서
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Context 생성
const AuthContext = createContext();

// Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = () => {
      console.log('AuthContext: Initializing auth...');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');

      console.log('AuthContext: Tokens found:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        hasUser: !!user 
      });

      if (accessToken && refreshToken && user) {
        try {
          const userData = JSON.parse(user);
          console.log('AuthContext: User data parsed:', userData);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user: userData,
              accessToken,
              refreshToken,
            },
          });
        } catch (error) {
          console.error('AuthContext: Error parsing user data:', error);
          // 저장된 데이터가 손상된 경우 로그아웃 처리
          logout();
        }
      } else {
        console.log('AuthContext: No valid tokens found, setting loading to false');
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // 기존 이메일/비밀번호 로그인 제거 - Google OAuth2만 사용

  // OAuth2 토큰으로 로그인
  const loginWithToken = async (accessToken, refreshToken) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      // 토큰 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 토큰으로 사용자 정보 가져오기
      const userData = await authAPI.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user: userData, accessToken, refreshToken },
      });

      return { success: true };
    } catch (error) {
      console.error('Token login error:', error);
      // 토큰이 유효하지 않은 경우 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 로그아웃 API 호출 실패해도 로컬 상태는 정리
      console.error('Logout API failed:', error);
    } finally {
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      dispatch({ type: AuthActionTypes.LOGOUT });
      toast.success('로그아웃되었습니다.');
    }
  };

  // 사용자 정보 업데이트
  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({ type: AuthActionTypes.UPDATE_USER, payload: userData });
  };

  const value = {
    ...state,
    loginWithToken,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
