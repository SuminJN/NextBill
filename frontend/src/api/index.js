import api from '../utils/axios';
import toast from 'react-hot-toast';

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// 사용자 관련 API
export const userAPI = {
  // 회원가입
  register: async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  // 이메일 중복 확인
  checkEmail: async (email) => {
    const response = await api.get(`/api/users/exists?email=${email}`);
    return response.data;
  },

  // 사용자 정보 조회
  getUser: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // 사용자 정보 업데이트
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  // 이메일 알림 설정 업데이트
  updateEmailAlertSetting: async (userId, isEmailAlertEnabled) => {
    const response = await api.patch(`/api/users/${userId}/email-alert?isEmailAlertEnabled=${isEmailAlertEnabled}`);
    return response.data;
  },

  // 계정 삭제
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },
};

// 구독 관련 API
export const subscriptionAPI = {
  // 사용자의 구독 목록 조회
  getSubscriptions: async (userId) => {
    const response = await api.get(`/api/subscriptions/user/${userId}`);
    return response.data;
  },

  // 구독 생성
  createSubscription: async (subscriptionData) => {
    const response = await api.post('/api/subscriptions', subscriptionData);
    return response.data;
  },

  // 구독 수정
  updateSubscription: async (subscriptionId, subscriptionData) => {
    const response = await api.put(`/api/subscriptions/${subscriptionId}`, subscriptionData);
    return response.data;
  },

  // 구독 삭제
  deleteSubscription: async (subscriptionId) => {
    const response = await api.delete(`/api/subscriptions/${subscriptionId}`);
    return response.data;
  },

  // 구독 일시정지/재개
  togglePause: async (subscriptionId) => {
    const response = await api.patch(`/api/subscriptions/${subscriptionId}/pause`);
    return response.data;
  },
};

// 에러 처리 유틸리티
export const handleApiError = (error) => {
  let errorMessage;
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.status === 401) {
    errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
  } else if (error.response?.status === 403) {
    errorMessage = '권한이 없습니다.';
  } else if (error.response?.status === 404) {
    errorMessage = '요청한 리소스를 찾을 수 없습니다.';
  } else if (error.response?.status >= 500) {
    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = '요청 시간이 초과되었습니다.';
  } else {
    errorMessage = '알 수 없는 오류가 발생했습니다.';
  }
  
  // 토스트로 에러 메시지 표시
  toast.error(errorMessage);
  
  return errorMessage;
};

// 성공 메시지 표시 유틸리티
export const showSuccessMessage = (message) => {
  toast.success(message);
};

// 정보 메시지 표시 유틸리티
export const showInfoMessage = (message) => {
  toast(message, { icon: 'ℹ️' });
};
