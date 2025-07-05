import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI, handleApiError } from '../api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 백엔드 데이터를 프론트엔드 형식으로 변환
  const transformNotification = (backendNotification) => {
    return {
      id: backendNotification.id,
      subscriptionId: backendNotification.subscriptionName ? backendNotification.id : null,
      subscriptionName: backendNotification.subscriptionName,
      message: backendNotification.message,
      priority: backendNotification.priority.toLowerCase(),
      daysUntil: backendNotification.daysUntil,
      isRead: backendNotification.isRead,
      createdAt: backendNotification.createdAt,
      readAt: backendNotification.readAt,
      type: backendNotification.type,
    };
  };

  // 알림 데이터 로드
  const loadNotifications = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationAPI.getNotifications(user.userId),
        notificationAPI.getUnreadCount(user.userId)
      ]);
      
      const transformedNotifications = notificationsData.map(transformNotification);
      setNotifications(transformedNotifications);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('알림 로드 실패:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 로그인 시 알림 로드
  useEffect(() => {
    if (user?.userId) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.userId]);

  // 읽음 처리
  const markAsRead = async (notificationId) => {
    if (!user?.userId) return;

    try {
      await notificationAPI.markAsRead(notificationId, user.userId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      handleApiError(error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!user?.userId) return;

    try {
      await notificationAPI.markAllAsRead(user.userId);
      
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: now 
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      handleApiError(error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId) => {
    if (!user?.userId) return;

    try {
      await notificationAPI.deleteNotification(notificationId, user.userId);
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      handleApiError(error);
    }
  };

  // 모든 알림 삭제
  const clearAllNotifications = async () => {
    if (!user?.userId) return;

    try {
      await notificationAPI.clearAllNotifications(user.userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 삭제 실패:', error);
      handleApiError(error);
    }
  };

  // 새 알림 생성 (테스트용)
  const createTestNotification = async (message, priority = 'medium') => {
    if (!user?.userId) return;

    try {
      const notificationData = {
        message,
        type: 'SYSTEM',
        priority: priority.toUpperCase(),
        daysUntil: null
      };

      const newNotification = await notificationAPI.createNotification(user.userId, notificationData);
      const transformedNotification = transformNotification(newNotification);
      
      setNotifications(prev => [transformedNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('테스트 알림 생성 실패:', error);
      handleApiError(error);
    }
  };

  // 결제일 기반 알림 생성
  const generatePaymentNotifications = async () => {
    try {
      await notificationAPI.generatePaymentNotifications();
      // 생성 후 알림 목록 새로고침
      await loadNotifications();
    } catch (error) {
      console.error('결제일 기반 알림 생성 실패:', error);
      handleApiError(error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createTestNotification,
    generatePaymentNotifications,
    refreshNotifications: loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
