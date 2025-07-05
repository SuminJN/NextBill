import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI, handleApiError, showSuccessMessage } from '../api';

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isXsOnly = useMediaQuery(theme.breakpoints.only('xs'));
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  
  // 필터링 관련 상태
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billingCycle: 'MONTHLY',
    startDate: '',
    nextPaymentDate: '',
    isPaused: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchSubscriptions();
    }
  }, [user]);

  // URL 파라미터를 통해 필터 설정
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    if (filter) {
      setFilterTab(filter);
    }
  }, [location.search]);

  // 필터링된 구독 목록 계산
  const filteredSubscriptions = subscriptions.filter(subscription => {
    // 검색어 필터링
    const matchesSearch = searchTerm === '' || 
      subscription.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 탭 필터링
    const matchesTab = () => {
      switch (filterTab) {
        case 'active':
          return !subscription.isPaused;
        case 'paused':
          return subscription.isPaused;
        case 'upcoming':
          const nextPayment = new Date(subscription.nextPaymentDate);
          const today = new Date();
          const diffTime = nextPayment - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0 && !subscription.isPaused;
        case 'all':
        default:
          return true;
      }
    };
    
    return matchesSearch && matchesTab();
  });

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionAPI.getSubscriptions(user.userId);
      setSubscriptions(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (subscription = null) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        name: subscription.name,
        cost: subscription.cost.toString(),
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate,
        nextPaymentDate: subscription.nextPaymentDate,
        isPaused: subscription.isPaused,
      });
    } else {
      setEditingSubscription(null);
      setFormData({
        name: '',
        cost: '',
        billingCycle: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: '',
        isPaused: false,
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubscription(null);
    setFormData({
      name: '',
      cost: '',
      billingCycle: 'MONTHLY',
      startDate: '',
      nextPaymentDate: '',
      isPaused: false,
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '서비스명을 입력해주세요.';
    } else if (formData.name.length > 100) {
      errors.name = '서비스명은 100자 이하여야 합니다.';
    }
    
    if (!formData.cost) {
      errors.cost = '금액을 입력해주세요.';
    } else if (isNaN(formData.cost) || Number(formData.cost) <= 0) {
      errors.cost = '유효한 금액을 입력해주세요.';
    }
    
    if (!formData.nextPaymentDate) {
      errors.nextPaymentDate = '다음 결제일을 선택해주세요.';
    } else if (new Date(formData.nextPaymentDate) <= new Date()) {
      errors.nextPaymentDate = '다음 결제일은 미래 날짜여야 합니다.';
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        userId: user.userId,
        name: formData.name,
        cost: Number(formData.cost),
        billingCycle: formData.billingCycle,
        startDate: formData.startDate || null,
        nextPaymentDate: formData.nextPaymentDate,
        isPaused: formData.isPaused,
      };

      if (editingSubscription) {
        await subscriptionAPI.updateSubscription(editingSubscription.subscriptionId, submitData);
        showSuccessMessage('구독이 수정되었습니다.');
      } else {
        await subscriptionAPI.createSubscription(submitData);
        showSuccessMessage('구독이 추가되었습니다.');
      }

      await fetchSubscriptions();
      handleCloseDialog();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePause = async (subscription) => {
    try {
      await subscriptionAPI.togglePause(subscription.subscriptionId);
      showSuccessMessage(
        subscription.isPaused ? '구독이 재개되었습니다.' : '구독이 일시정지되었습니다.'
      );
      await fetchSubscriptions();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteConfirm = (subscription) => {
    setSubscriptionToDelete(subscription);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!subscriptionToDelete) return;

    try {
      await subscriptionAPI.deleteSubscription(subscriptionToDelete.subscriptionId);
      showSuccessMessage('구독이 삭제되었습니다.');
      await fetchSubscriptions();
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const getBillingCycleText = (cycle) => {
    switch (cycle) {
      case 'MONTHLY': return '월간';
      case 'YEARLY': return '연간';
      case 'WEEKLY': return '주간';
      default: return cycle;
    }
  };

  // 모바일용 구독 카드 컴포넌트
  const SubscriptionCard = ({ subscription }) => (
    <Card sx={{ 
      mb: 2, 
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="div" sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 600,
            wordBreak: 'break-word',
            flex: 1,
            mr: 1
          }}>
            {subscription.name}
          </Typography>
          <Chip
            label={subscription.isPaused ? '일시정지' : '활성'}
            color={subscription.isPaused ? 'warning' : 'success'}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              금액
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              ₩{subscription.cost.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              결제 주기
            </Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {getBillingCycleText(subscription.billingCycle)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              다음 결제일
            </Typography>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {subscription.nextPaymentDate}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ 
        justifyContent: 'flex-end', 
        pt: 0, 
        px: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 3 },
        gap: 0.5
      }}>
        <Tooltip title="수정">
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(subscription)}
            sx={{ 
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={subscription.isPaused ? '재개' : '일시정지'}>
          <IconButton
            size="small"
            onClick={() => handleTogglePause(subscription)}
            sx={{ 
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' }
            }}
          >
            {subscription.isPaused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="삭제">
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteConfirm(subscription)}
            sx={{ 
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 3 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
          gap: { xs: 2, sm: 0 },
          mb: 2 
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
              구독 관리
            </Typography>
            <Typography variant="body1" color="text.secondary">
              모든 구독 서비스를 한 곳에서 관리하세요
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size={isMobile ? 'medium' : 'large'}
            fullWidth={isXsOnly}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            구독 추가
          </Button>
        </Box>
      </Box>

      {/* 필터링 및 검색 UI */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        <Stack direction="column" spacing={2}>
          <Box sx={{ overflow: 'auto' }}>
            <Tabs 
              value={filterTab} 
              onChange={(e, newValue) => setFilterTab(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{ 
                minWidth: 'auto',
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  mr: 1,
                  minWidth: { xs: 'auto', sm: 90 },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 0,
                },
              }}
            >
              <Tab label="전체" value="all" />
              <Tab label="활성" value="active" />
              <Tab label="일시정지" value="paused" />
              <Tab label="곧 결제" value="upcoming" />
            </Tabs>
          </Box>
          
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={2} 
            alignItems={isMobile ? 'stretch' : 'center'}
          >
            <TextField
              size="small"
              placeholder="구독 서비스 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth={isMobile}
              sx={{ 
                minWidth: { xs: 'auto', sm: 250 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.06)',
                  },
                },
              }}
            />
            
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                textAlign: 'center',
                minWidth: 'fit-content',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {filteredSubscriptions.length}개 구독
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* 모바일 뷰 - 카드 형태 */}
      {isMobile ? (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          {filteredSubscriptions.length === 0 ? (
            <Paper sx={{ 
              p: { xs: 2, sm: 3 }, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}>
              <Typography color="text.secondary">
                {subscriptions.length === 0 ? '등록된 구독이 없습니다.' : '조건에 맞는 구독이 없습니다.'}
              </Typography>
            </Paper>
          ) : (
            filteredSubscriptions.map((subscription) => (
              <SubscriptionCard 
                key={subscription.subscriptionId} 
                subscription={subscription} 
              />
            ))
          )}
        </Box>
      ) : (
        /* 데스크톱 뷰 - 테이블 형태 */
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            overflow: 'auto',
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>서비스명</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>금액</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>결제 주기</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>다음 결제일</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>상태</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {subscriptions.length === 0 ? '등록된 구독이 없습니다.' : '조건에 맞는 구독이 없습니다.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow 
                    key={subscription.subscriptionId}
                    sx={{ 
                      '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.02)' },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{subscription.name}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₩{subscription.cost.toLocaleString()}
                    </TableCell>
                    <TableCell>{getBillingCycleText(subscription.billingCycle)}</TableCell>
                    <TableCell>{subscription.nextPaymentDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={subscription.isPaused ? '일시정지' : '활성'}
                        color={subscription.isPaused ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="수정">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(subscription)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={subscription.isPaused ? '재개' : '일시정지'}>
                          <IconButton
                            size="small"
                            onClick={() => handleTogglePause(subscription)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' }
                            }}
                          >
                            {subscription.isPaused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteConfirm(subscription)}
                            sx={{ 
                              borderRadius: 2,
                              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 구독 추가/수정 Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubscription ? '구독 수정' : '구독 추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="서비스명"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="cost"
            label="금액"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.cost}
            onChange={handleFormChange}
            error={!!formErrors.cost}
            helperText={formErrors.cost}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>결제 주기</InputLabel>
            <Select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleFormChange}
              label="결제 주기"
            >
              <MenuItem value="WEEKLY">주간</MenuItem>
              <MenuItem value="MONTHLY">월간</MenuItem>
              <MenuItem value="YEARLY">연간</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="startDate"
            label="시작일"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.startDate}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="nextPaymentDate"
            label="다음 결제일"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.nextPaymentDate}
            onChange={handleFormChange}
            error={!!formErrors.nextPaymentDate}
            helperText={formErrors.nextPaymentDate}
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : (editingSubscription ? '수정' : '추가')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>구독 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            '{subscriptionToDelete?.name}' 구독을 정말 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionsPage;
