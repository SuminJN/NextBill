import { createTheme } from '@mui/material/styles'

// 라이트 모드와 다크 모드 팔레트 정의
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#6366f1', // Modern indigo
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ec4899', // Modern pink
    light: '#f472b6',
    dark: '#db2777',
  },
  background: {
    default: '#fafbfc', // Ultra light gray
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
  },
  divider: '#e5e7eb',
  success: {
    main: '#10b981', // Modern green
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b', // Modern amber
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444', // Modern red
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#3b82f6', // Modern blue
    light: '#60a5fa',
    dark: '#2563eb',
  },
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#818cf8', // Lighter indigo for dark mode
    light: '#a5b4fc',
    dark: '#6366f1',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f472b6', // Lighter pink for dark mode
    light: '#f9a8d4',
    dark: '#ec4899',
  },
  background: {
    default: '#0f172a', // Dark slate
    paper: '#1e293b', // Slate 800
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
  },
  divider: '#334155',
  success: {
    main: '#34d399', // Lighter green for dark mode
    light: '#6ee7b7',
    dark: '#10b981',
  },
  warning: {
    main: '#fbbf24', // Lighter amber for dark mode
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  error: {
    main: '#f87171', // Lighter red for dark mode
    light: '#fca5a5',
    dark: '#ef4444',
  },
  info: {
    main: '#60a5fa', // Lighter blue for dark mode
    light: '#93c5fd',
    dark: '#3b82f6',
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// 테마 생성 함수
export const createAppTheme = (mode = 'light') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette,
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        letterSpacing: '-0.025em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        color: mode === 'dark' ? '#94a3b8' : '#6b7280',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: mode === 'dark' ? [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    ] : [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ] : [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 500,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: 'none',
            backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
            boxShadow: mode === 'dark' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: mode === 'dark' ? '1px solid #334155' : '1px solid #f3f4f6',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease-in-out',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
            boxShadow: mode === 'dark' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: mode === 'dark' ? '1px solid #334155' : '1px solid #f3f4f6',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: mode === 'dark' ? '#334155' : '#ffffff',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#64748b' : '#d1d5db',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 1,
                },
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#475569' : '#e5e7eb',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiStepper: {
        styleOverrides: {
          root: {
            '& .MuiStepConnector-root': {
              '& .MuiStepConnector-line': {
                borderColor: mode === 'dark' ? '#475569' : '#e5e7eb',
                borderWidth: 2,
              },
            },
            '& .MuiStepLabel-root': {
              '& .MuiStepLabel-iconContainer': {
                '& .MuiStepIcon-root': {
                  color: mode === 'dark' ? '#475569' : '#e5e7eb',
                  '&.Mui-active': {
                    color: '#6366f1',
                  },
                  '&.Mui-completed': {
                    color: '#10b981',
                  },
                },
              },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
          },
        },
      },
      MuiStepper: {
        styleOverrides: {
          root: {
            '& .MuiStepConnector-root': {
              '& .MuiStepConnector-line': {
                borderColor: mode === 'dark' ? '#475569' : '#e5e7eb',
                borderWidth: 2,
              },
            },
            '& .MuiStepLabel-root': {
              '& .MuiStepLabel-iconContainer': {
                '& .MuiStepIcon-root': {
                  color: mode === 'dark' ? '#475569' : '#e5e7eb',
                  '&.Mui-active': {
                    color: '#6366f1',
                  },
                  '&.Mui-completed': {
                    color: '#10b981',
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

// 기본 라이트 테마 (기존 코드와의 호환성)
const theme = createAppTheme('light');
export default theme;
