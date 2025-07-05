import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Subscriptions as SubscriptionsIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const WelcomeModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'NextBill에 오신 것을 환영합니다! 🎉',
      subtitle: '구독 서비스를 스마트하게 관리하세요',
      content: (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 auto 24px',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
            }}
          >
            N
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
            NextBill은 모든 구독 서비스를 한 곳에서 관리할 수 있는 
            똑똑한 구독 관리 플랫폼입니다.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="📊 구독 현황 분석" color="primary" variant="outlined" />
            <Chip label="💰 비용 추적" color="primary" variant="outlined" />
            <Chip label="🔔 결제 알림" color="primary" variant="outlined" />
          </Box>
        </Box>
      )
    },
    {
      title: '대시보드에서 한눈에 확인',
      subtitle: '구독 현황을 쉽게 파악하세요',
      content: (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DashboardIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                실시간 대시보드
              </Typography>
              <Typography variant="body2" color="text.secondary">
                활성 구독, 월 예상 비용, 곧 결제될 구독을 한눈에
              </Typography>
            </Box>
          </Box>
          
          <Card sx={{ mb: 2, backgroundColor: 'rgba(99, 102, 241, 0.04)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                💡 <strong>팁:</strong> 통계 카드를 클릭하면 해당 필터로 구독 목록을 볼 수 있어요!
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )
    },
    {
      title: '구독 관리의 모든 기능',
      subtitle: '추가, 수정, 일시정지까지 간편하게',
      content: (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SubscriptionsIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                구독 관리 페이지
              </Typography>
              <Typography variant="body2" color="text.secondary">
                모든 구독을 체계적으로 관리할 수 있습니다
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.04)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                  ✨ 주요 기능
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  • 구독 추가/수정/삭제<br/>
                  • 일시정지/재개<br/>
                  • 필터링 및 검색<br/>
                  • 결제일 관리
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ backgroundColor: 'rgba(255, 152, 0, 0.04)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                  🎯 스마트 필터
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  • 전체/활성/일시정지<br/>
                  • 곧 결제될 구독<br/>
                  • 서비스명 검색<br/>
                  • 모바일 카드뷰
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )
    },
    {
      title: '이제 시작해보세요! 🚀',
      subtitle: '첫 구독을 추가하고 NextBill의 편리함을 경험해보세요',
      content: (
        <Box sx={{ textAlign: 'center', py: 0 }}>
          <Box sx={{ mb: 4 }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'info.main', mb: 2,}} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              놓치지 마세요!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              결제일 7일 전부터 알림을 받아<br/>
              예상치 못한 결제를 방지하세요.
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 시작하기 추천 순서
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
              1. 우상단 "구독 추가" 버튼 클릭<br/>
              2. 첫 번째 구독 서비스 등록<br/>
              3. 대시보드에서 현황 확인<br/>
              4. 필요시 알림 설정 조정
            </Typography>
          </Box>
        </Box>
      )
    }
  ];

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    // 오늘 날짜를 localStorage에 저장하여 하루동안 다시 표시하지 않음
    localStorage.setItem('nextbill_welcome_shown', new Date().toDateString());
    onClose();
  };

  const handleDontShowToday = () => {
    // 오늘 날짜를 localStorage에 저장하여 오늘 하루동안 다시 표시하지 않음
    localStorage.setItem('nextbill_welcome_shown', new Date().toDateString());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          minHeight: isMobile ? '85vh' : 650,
          maxHeight: isMobile ? '90vh' : 700,
          width: isMobile ? '95vw' : 720,
          maxWidth: isMobile ? '95vw' : 720,
        }
      }}
    >
      <Box sx={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(236, 72, 153, 0.02) 100%)',
      }}>
        {/* 헤더 */}
        <Box sx={{ 
          p: 3, 
          pb: 1,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          position: 'relative'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {steps[activeStep].title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {steps[activeStep].subtitle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 스테퍼 */}
        <Box sx={{ px: 3, mb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
            {steps.map((_, index) => (
              <Step key={index}>
                <StepLabel />
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* 컨텐츠 */}
        <DialogContent sx={{ px: 4, py: 2, minHeight: 320, maxHeight: 400, overflow: 'auto' }}>
          {steps[activeStep].content}
        </DialogContent>

        {/* 액션 버튼 */}
        <DialogActions sx={{ p: 3, pt: 1, gap: 1, justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ChevronLeftIcon />}
            variant="outlined"
            size="large"
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              borderColor: 'rgba(99, 102, 241, 0.3)',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
              },
              '&:disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.disabled',
              },
            }}
          >
            이전
          </Button>
          
          <Button
            onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
            variant="contained"
            endIcon={activeStep === steps.length - 1 ? undefined : <ChevronRightIcon />}
            size="large"
            sx={{
              px: 3.5, // 모든 단계에서 동일한 padding 사용
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              minWidth: 120, // 최소 너비 지정으로 버튼 크기 일관성 유지
              '&:hover': {
                background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
              },
            }}
          >
            {activeStep === steps.length - 1 ? '시작하기 🚀' : '다음'}
          </Button>
        </DialogActions>

        {/* 하단 추가 옵션 */}
        <Box sx={{ 
          px: 3, 
          pb: 2, 
          display: 'flex', 
          justifyContent: 'center',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          pt: 2,
          mt: 1,
        }}>
          <Button
            onClick={handleDontShowToday}
            variant="text"
            size="small"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            오늘 다시 열지 않기
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default WelcomeModal;
