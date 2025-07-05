import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  ButtonBase,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Subscriptions as SubscriptionsIcon,
  Pause as PauseIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI, handleApiError } from '../api';

// 이메일에서 @ 이전 부분만 추출하는 함수
const getEmailUsername = (email) => {
  if (!email) return '';
  return email.split('@')[0];
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('DashboardPage - Current user:', user);

  useEffect(() => {
    console.log('User found, attempting to fetch subscriptions...');
    
    // 사용자 정보가 불완전한 경우 처리
    if (user?.needsUserInfo) {
      console.log('User info incomplete, showing dashboard without subscriptions');
      setIsLoading(false);
      return;
    }
    
    if (user?.userId) {
      console.log('User found with userId, fetching subscriptions...');
      fetchSubscriptions();
    } else if (user?.email) {
      console.log('User found with email but no userId, showing limited dashboard');
      setIsLoading(false);
    } else {
      console.log('No user found:', user);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching subscriptions for user:', user.userId);
      const data = await subscriptionAPI.getSubscriptions(user.userId);
      console.log('Subscriptions data received:', data);
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 통계 계산
  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(sub => !sub.isPaused).length,
    pausedSubscriptions: subscriptions.filter(sub => sub.isPaused).length,
    totalMonthlyCost: subscriptions
      .filter(sub => !sub.isPaused)
      .reduce((total, sub) => {
        let monthlyCost;
        switch (sub.billingCycle) {
          case 'MONTHLY':
            monthlyCost = sub.cost;
            break;
          case 'YEARLY':
            monthlyCost = sub.cost / 12;
            break;
          case 'WEEKLY':
            monthlyCost = sub.cost * 4.33; // 1개월 = 약 4.33주
            break;
          default:
            monthlyCost = sub.cost; // CUSTOM 등
        }
        return total + monthlyCost;
      }, 0),
  };

  // 곧 결제될 구독들 (7일 이내)
  const upcomingPayments = subscriptions
    .filter(sub => !sub.isPaused)
    .filter(sub => {
      const nextPayment = new Date(sub.nextPaymentDate);
      const today = new Date();
      const diffTime = nextPayment - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    })
    .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate));

  // 카드 클릭 핸들러
  const handleCardClick = (filter) => {
    navigate(`/subscriptions?filter=${filter}`);
  };

  const StatCard = ({ title, value, icon, color = 'primary', filter = null, clickable = false }) => {
    const cardContent = (
      <Card sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...(clickable && {
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          cursor: 'pointer',
        })
      }}>
        {/* 배경 장식 요소 */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: `${color}.main`,
            opacity: 0.1,
            transition: 'all 0.3s ease-in-out',
            ...(clickable && {
              '&:hover': {
                transform: 'scale(1.2)',
                opacity: 0.15,
              }
            })
          }}
        />
        
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'grey.600', 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'grey.900',
                  lineHeight: 1.2,
                  mb: 0.5
                }}
              >
                {value}
              </Typography>
              {clickable && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: `${color}.main`, 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  자세히 보기 →
                </Typography>
              )}
            </Box>
            <Box 
              sx={{ 
                color: `${color}.main`,
                opacity: 0.8,
                transform: 'scale(1.1)',
                transition: 'all 0.3s ease-in-out',
                ...(clickable && {
                  '&:hover': {
                    transform: 'scale(1.2)',
                    opacity: 1,
                  }
                })
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );

    if (clickable) {
      return (
        <Box 
          onClick={() => handleCardClick(filter)}
          sx={{ 
            width: '100%', 
            height: '100%',
            cursor: 'pointer',
          }}
        >
          {cardContent}
        </Box>
      );
    }

    return cardContent;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // 사용자 정보가 없거나 불완전한 경우 처리
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          사용자 정보를 불러오는 중입니다...
        </Typography>
      </Container>
    );
  }

  // 사용자 정보가 불완전한 경우 (userId 없음)
  if (!user.userId) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          안녕하세요, {getEmailUsername(user?.email)}님!
        </Typography>
        <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
          사용자 정보를 완전히 불러오지 못했습니다. 페이지를 새로고침해주세요.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          디버그: {JSON.stringify(user)}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="fade-in">
      {/* 헤더 섹션 */}
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
          대시보드
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'grey.600', 
            fontSize: '1.125rem',
            fontWeight: 400,
          }}
        >
          안녕하세요, <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{getEmailUsername(user?.email)}님</Box>! 구독 현황을 확인해보세요.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 통계 카드들 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 구독"
            value={stats.totalSubscriptions}
            icon={<SubscriptionsIcon sx={{ fontSize: 40 }} />}
            color="primary"
            filter="all"
            clickable={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="활성 구독"
            value={stats.activeSubscriptions}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="success"
            filter="active"
            clickable={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="일시정지"
            value={stats.pausedSubscriptions}
            icon={<PauseIcon sx={{ fontSize: 40 }} />}
            color="warning"
            filter="paused"
            clickable={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="월 예상 비용"
            value={`₩${stats.totalMonthlyCost.toLocaleString()}`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="info"
            clickable={false}
          />
        </Grid>

        {/* 곧 결제될 구독들 */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* 배경 장식 */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            />
            
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center">
                <TodayIcon sx={{ mr: 2, fontSize: 28 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    곧 결제될 구독
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    앞으로 7일 이내 결제 예정
                  </Typography>
                </Box>
              </Box>
              {upcomingPayments.length > 0 && (
                <ButtonBase
                  onClick={() => handleCardClick('upcoming')}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    전체 보기
                  </Typography>
                </ButtonBase>
              )}
            </Box>
            
            {upcomingPayments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
                  🎉 곧 결제될 구독이 없습니다
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  모든 구독이 안전하게 관리되고 있어요!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                {upcomingPayments.map((subscription) => {
                  const daysUntilPayment = Math.ceil(
                    (new Date(subscription.nextPaymentDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Grid item xs={12} sm={6} md={4} key={subscription.subscriptionId}>
                      <Card sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ color: 'grey.900', mb: 1, fontWeight: 600 }}>
                            {subscription.name}
                          </Typography>
                          <Typography variant="h5" sx={{ color: 'grey.800', mb: 2, fontWeight: 700 }}>
                            ₩{subscription.cost.toLocaleString()}
                          </Typography>
                          <Chip
                            label={
                              daysUntilPayment === 0
                                ? '🔥 오늘 결제'
                                : `⏰ ${daysUntilPayment}일 후`
                            }
                            color={daysUntilPayment <= 1 ? 'error' : 'warning'}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 1.5,
                              }
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
