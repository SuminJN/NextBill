import { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  Divider,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationPanel = () => {
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <WarningIcon sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'medium':
        return <ScheduleIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'low':
        return <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />;
      default:
        return <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  };

  const sortedNotifications = notifications.sort((a, b) => {
    // 읽지 않은 것을 먼저, 그 다음 우선순위, 마지막으로 시간순
    if (a.isRead !== b.isRead) {
      return a.isRead - b.isRead;
    }
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              minWidth: '18px',
              height: '18px',
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: { xs: '90vw', sm: 400 },
            maxWidth: 400,
            maxHeight: 500,
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* 헤더 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              알림 ({unreadCount})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={markAllAsRead}
                  sx={{ 
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  모두 읽음
                </Button>
              )}
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* 알림 목록 */}
          {sortedNotifications.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary' 
            }}>
              <NotificationsIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography variant="body2">
                새로운 알림이 없습니다
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 350, overflow: 'auto', p: 0, mt: 1 }}>
              {sortedNotifications.map((notification, index) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    px: 1.5,
                    py: 1.5,
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: notification.isRead 
                      ? 'transparent' 
                      : theme.palette.mode === 'dark' 
                        ? 'rgba(99, 102, 241, 0.1)' 
                        : 'rgba(99, 102, 241, 0.04)',
                    border: notification.isRead 
                      ? 'none' 
                      : `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(99, 102, 241, 0.3)' 
                          : 'rgba(99, 102, 241, 0.2)'}`,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.02)',
                    },
                    '&:last-child': {
                      mb: 0,
                    },
                  }}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <Box sx={{ mr: 1.5 }}>
                    {getPriorityIcon(notification.priority)}
                  </Box>
                  
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notification.isRead ? 400 : 600,
                          lineHeight: 1.4,
                          mb: 0.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                          label={notification.daysUntil === 0 ? '오늘' : `${notification.daysUntil}일 후`}
                          size="small"
                          color={getPriorityColor(notification.priority)}
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 20,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction sx={{ right: 8 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {/* 하단 액션 */}
          {sortedNotifications.length > 0 && (
            <>
              <Divider sx={{ mt: 2, mb: 1 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={clearAllNotifications}
                  sx={{ fontSize: '0.75rem' }}
                >
                  모든 알림 삭제
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPanel;
