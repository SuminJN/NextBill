import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Subscriptions as SubscriptionsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import Footer from '../Footer/Footer';
import NotificationPanel from '../NotificationPanel/NotificationPanel';

const drawerWidth = 260;

const Layout = () => {
  const theme = useTheme();
  const { isDarkMode, toggleDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '구독 관리', icon: <SubscriptionsIcon />, path: '/subscriptions' },
    { text: '프로필', icon: <PersonIcon />, path: '/profile' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.02) 0%, rgba(236, 72, 153, 0.02) 100%)',
      position: 'relative',
    }}>
      {/* 사이드바 헤더 */}
      <Box sx={{ 
        height: 80, // 높이를 줄여서 더 깔끔하게
        px: 3, // 패딩을 줄여서 더 왼쪽에 붙게
        py: 2,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
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
            background: 'rgba(255, 255, 255, 0.1)',
            opacity: 0.5,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            opacity: 0.7,
          }}
        />
        
        {/* 로고와 브랜드명 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1, ml: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            N
          </Box>
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              NextBill
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
              구독 관리 플랫폼
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* 네비게이션 메뉴 */}
      <Box sx={{ px: 2, py: 3 }}>
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.16)',
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: { 
            xs: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
            md: 'transparent' 
          },
          backdropFilter: { xs: 'blur(10px)', md: 'none' },
          borderBottom: { 
            xs: isDarkMode ? '1px solid rgba(51, 65, 85, 0.6)' : '1px solid rgba(0, 0, 0, 0.06)', 
            md: 'none' 
          },
          color: 'text.primary',
          boxShadow: 'none',
          display: { md: 'none' }, // 데스크탑에서는 완전히 숨김
        }}
      >
        <Toolbar 
          sx={{ 
            px: { xs: 2, sm: 3 },
            height: 64,
            minHeight: '64px !important',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ mr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                N
              </Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
                NextBill
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={toggleDarkMode}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' }
              }}
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <NotificationPanel />
            
            <IconButton onClick={handleAvatarClick} sx={{ p: 0, ml: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderTop: 'none',
              borderRight: '1px solid rgba(0, 0, 0, 0.04)',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
              top: 0,
              height: '100vh',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3 },
          py: { xs: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          position: 'relative',
        }}
      >
        {/* 데스크탑용 플로팅 헤더 */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'absolute',
            top: 24,
            right: 24,
            alignItems: 'center',
            gap: 1,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: '8px 12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            ...(isDarkMode && {
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
            }),
          }}
        >
          <IconButton 
            onClick={toggleDarkMode}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' }
            }}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <NotificationPanel />
          
          <IconButton onClick={handleAvatarClick} sx={{ p: 0, ml: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 36,
                height: 36,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                구독 관리 계정
              </Typography>
            </Box>
            <MenuItem 
              onClick={() => { handleMenuClose(); navigate('/profile'); }}
              sx={{ py: 1.5, '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' } }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              프로필
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleLogout}
              sx={{ py: 1.5, '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <Typography sx={{ color: 'error.main' }}>로그아웃</Typography>
            </MenuItem>
          </Menu>
        </Box>
        
        {/* 모바일에서는 AppBar 아래 배치, 데스크탑에서는 플로팅 헤더 아래 배치 */}
        <Box sx={{ height: { xs: 64, md: 0 } }} />
        <Box sx={{ mt: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
