import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  FormGroup,
  Alert,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, handleApiError } from '../api';
import toast from 'react-hot-toast';

const EmailSettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    isEmailAlertEnabled: true,
    emailAlert7Days: true,
    emailAlert3Days: true,
    emailAlert1Day: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchEmailSettings();
    }
  }, [user]);

  const fetchEmailSettings = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getEmailSettings(user.userId);
      setSettings(data);
    } catch (error) {
      console.error('이메일 설정 조회 실패:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      [key]: event.target.checked
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await userAPI.updateEmailSettings(user.userId, settings);
      toast.success('이메일 설정이 저장되었습니다.');
    } catch (error) {
      console.error('이메일 설정 저장 실패:', error);
      handleApiError(error);
      toast.error('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
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
    <Container maxWidth="md" className="fade-in">
      <Box sx={{ mb: 4 }} className="fade-in-up">
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          이메일 알림 설정
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary', 
            fontSize: '1.125rem',
          }}
        >
          구독 결제 알림을 받을 시점을 설정하세요.
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* 전체 이메일 알림 설정 */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                이메일 알림 활성화
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.isEmailAlertEnabled}
                  onChange={handleSettingChange('isEmailAlertEnabled')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    이메일 알림 받기
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    모든 이메일 알림을 활성화/비활성화합니다
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 개별 알림 설정 */}
          <Box>
            <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
              <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                알림 시점 설정
              </Typography>
            </Box>

            {!settings.isEmailAlertEnabled && (
              <Alert severity="info" sx={{ mb: 3 }}>
                이메일 알림이 비활성화되어 있습니다. 위에서 먼저 이메일 알림을 활성화해주세요.
              </Alert>
            )}

            <FormGroup sx={{ gap: 2 }}>
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: settings.isEmailAlertEnabled ? 'background.paper' : 'action.disabledBackground',
                  borderRadius: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailAlert7Days}
                      onChange={handleSettingChange('emailAlert7Days')}
                      disabled={!settings.isEmailAlertEnabled}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        7일 전 알림
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        결제일 일주일 전에 미리 알림을 받습니다
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: settings.isEmailAlertEnabled ? 'background.paper' : 'action.disabledBackground',
                  borderRadius: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailAlert3Days}
                      onChange={handleSettingChange('emailAlert3Days')}
                      disabled={!settings.isEmailAlertEnabled}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        3일 전 알림
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        결제일 3일 전에 알림을 받습니다
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: settings.isEmailAlertEnabled ? 'background.paper' : 'action.disabledBackground',
                  borderRadius: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailAlert1Day}
                      onChange={handleSettingChange('emailAlert1Day')}
                      disabled={!settings.isEmailAlertEnabled}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        1일 전 알림
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        결제일 하루 전에 최종 알림을 받습니다
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </FormGroup>
          </Box>

          {/* 저장 버튼 */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : <NotificationsIcon />}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {isSaving ? '저장 중...' : '설정 저장'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 도움말 */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          💡 <strong>팁:</strong> 중요한 결제를 놓치지 않으려면 최소한 1일 전 알림은 활성화하는 것을 권장합니다.
          이메일은 등록된 이메일 주소로 발송됩니다.
        </Typography>
      </Alert>
    </Container>
  );
};

export default EmailSettingsPage;
