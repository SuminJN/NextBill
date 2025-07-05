import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI, handleApiError } from '../api';
import { subscriptionAPI } from '../api';

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

  // 알림 생성 함수
  const createNotification = (subscription, daysUntil) => {
    const id = `${subscription.subscriptionId}-${Date.now()}`;
    let message, priority;

    if (daysUntil === 0) {
      message = `🔥 ${subscription.name} - 오늘 결제일입니다! (₩${subscription.cost.toLocaleString()})`;
      priority = 'high';
    } else if (daysUntil === 1) {
      message = `⏰ ${subscription.name} - 내일 결제됩니다! (₩${subscription.cost.toLocaleString()})`;
      priority = 'high';
    } else if (daysUntil <= 3) {
      message = `📅 ${subscription.name} - ${daysUntil}일 후 결제됩니다 (₩${subscription.cost.toLocaleString()})`;
      priority = 'medium';
    } else if (daysUntil <= 7) {
      message = `📋 ${subscription.name} - ${daysUntil}일 후 결제 예정 (₩${subscription.cost.toLocaleString()})`;
      priority = 'low';
    } else {
      return null; // 7일 이후는 알림 생성하지 않음
    }

    return {
      id,
      subscriptionId: subscription.subscriptionId,
      subscriptionName: subscription.name,
      message,
      priority,
      daysUntil,
      cost: subscription.cost,
      nextPaymentDate: subscription.nextPaymentDate,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'payment_reminder'
    };
  };

  // 구독 데이터를 기반으로 알림 생성
  const generateNotifications = async () => {
    if (!user?.userId) return;

    try {
      const subscriptions = await subscriptionAPI.getSubscriptions(user.userId);
      const today = new Date();
      const newNotifications = [];

      subscriptions
        .filter(sub => !sub.isPaused) // 활성 구독만
        .forEach(subscription => {
          const nextPayment = new Date(subscription.nextPaymentDate);
          const diffTime = nextPayment - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const notification = createNotification(subscription, diffDays);
          if (notification) {
            // 중복 알림 방지 (같은 구독의 같은 날짜 알림이 이미 있는지 확인)
            const isDuplicate = notifications.some(
              n => n.subscriptionId === subscription.subscriptionId && 
                   n.daysUntil === diffDays &&
                   new Date(n.createdAt).toDateString() === today.toDateString()
            );
            
            if (!isDuplicate) {
              newNotifications.push(notification);
            }
          }
        });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  // 알림 읽음 처리
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  // 알림 삭제
  const deleteNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // 모든 알림 삭제
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // 페이지 로드 시 및 주기적으로 알림 생성
  useEffect(() => {
    if (user?.userId) {
      generateNotifications();
      
      // 매 시간마다 알림 체크
      const interval = setInterval(generateNotifications, 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  // localStorage에서 알림 복원
  useEffect(() => {
    const savedNotifications = localStorage.getItem('nextbill_notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.isRead).length);
    }
  }, []);

  // 알림 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('nextbill_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    generateNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
