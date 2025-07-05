import AppRoutes from './components/AppRoutes';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ThemeContextProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </ThemeContextProvider>
  );
}

export default App;
