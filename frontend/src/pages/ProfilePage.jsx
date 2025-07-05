import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  DeleteOutline as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, handleApiError, showSuccessMessage } from '../api';

// 날짜 포맷팅 유틸리티 함수
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일`;
};

// 가입 후 경과 일수 계산 함수
const calculateDaysSinceJoined = (createdAt) => {
  if (!createdAt) return 0;
  
  const joinDate = new Date(createdAt);
  const currentDate = new Date();
  const timeDiff = currentDate - joinDate;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff;
};

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getUser(user.userId);
      setUserInfo(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertToggle = async (event) => {
    const newValue = event.target.checked;
    const previousValue = userInfo?.isEmailAlertEnabled;
    
    // 즉시 UI 업데이트 (Optimistic Update)
    setUserInfo(prev => ({
      ...prev,
      isEmailAlertEnabled: newValue
    }));

    try {
      // API 호출
      const updatedUser = await userAPI.updateEmailAlertSetting(user.userId, newValue);
      
      // 성공 시 사용자 정보와 컨텍스트 업데이트
      setUserInfo(updatedUser);
      updateUser(updatedUser);
      
      showSuccessMessage(
        newValue 
          ? '이메일 알림이 활성화되었습니다.' 
          : '이메일 알림이 비활성화되었습니다.'
      );
    } catch (error) {
      // 실패 시 이전 값으로 되돌리기
      setUserInfo(prev => ({
        ...prev,
        isEmailAlertEnabled: previousValue
      }));
      handleApiError(error);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await userAPI.deleteUser(user.userId);
      
      showSuccessMessage('계정이 성공적으로 삭제되었습니다.');
      
      // 로그아웃 처리
      logout();
      
      // 홈페이지로 리다이렉트 (AuthContext에서 처리됨)
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 600,
              mr: 3,
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            }}
          >
            {userInfo?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              프로필
            </Typography>
            <Typography variant="body1" color="text.secondary">
              계정 정보와 설정을 관리하세요
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 계정 정보 카드 */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  계정 정보
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        이메일
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {userInfo?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        가입일
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(userInfo?.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {userInfo?.createdAt 
                          ? `가입한 지 ${calculateDaysSinceJoined(userInfo.createdAt)}일이 지났습니다.`
                          : ''
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 통계 카드 */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                }}
              >
                <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                환영합니다!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                NextBill과 함께 구독을 스마트하게 관리하세요
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 알림 설정 카드 */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  알림 설정
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={userInfo?.isEmailAlertEnabled || false}
                      onChange={handleAlertToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        이메일 알림 받기
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        구독 결제일 알림을 이메일로 받을 수 있습니다.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 계정 삭제 카드 */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, rgba(239, 68, 68, 0.05) 100%)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WarningIcon sx={{ mr: 2, color: 'error.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  주의
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  계정 삭제
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  계정을 삭제하면 모든 구독 정보가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    },
                  }}
                >
                  {isDeleting ? '삭제 중...' : '계정 삭제'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 계정 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 500,
          }
        }}
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'error.main',
            fontWeight: 600,
          }}
        >
          <WarningIcon sx={{ mr: 2 }} />
          계정 삭제 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="delete-dialog-description"
            sx={{ fontSize: '1rem', lineHeight: 1.6 }}
          >
            정말로 계정을 삭제하시겠습니까?
            <br />
            <br />
            <strong>이 작업은 되돌릴 수 없으며, 다음 데이터가 영구적으로 삭제됩니다:</strong>
            <br />
            • 계정 정보
            <br />
            • 모든 구독 정보
            <br />
            • 결제 기록 및 알림 설정
            <br />
            <br />
            삭제를 원하시면 "삭제" 버튼을 클릭해주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ mr: 2, borderRadius: 2 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
