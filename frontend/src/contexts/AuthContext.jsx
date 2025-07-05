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
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');

      if (accessToken && refreshToken && user) {
        try {
          const userData = JSON.parse(user);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user: userData,
              accessToken,
              refreshToken,
            },
          });
        } catch (error) {
          // 저장된 데이터가 손상된 경우 로그아웃 처리
          logout();
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // 로그인
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      console.log('Attempting login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      const { accessToken, refreshToken, user } = response;

      // 토큰 우선 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 사용자 정보 처리
      let userData = user;
      if (!userData || !userData.email) {
        console.warn('User info not found in response, fetching separately...');
        try {
          userData = await authAPI.getCurrentUser();
          console.log('Fetched user data:', userData);
        } catch (fetchError) {
          console.error('Failed to fetch user info:', fetchError);
          // 최후의 수단으로 이메일 기반 임시 사용자 객체 생성
          userData = {
            email: credentials.userEmail,
            needsUserInfo: true
          };
        }
      }

      // 로컬 스토리지에 저장
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user: userData, accessToken, refreshToken },
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
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
    login,
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
