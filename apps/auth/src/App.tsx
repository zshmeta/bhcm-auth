import { ThemeProvider } from "@repo/ui";
import { AuthProvider, useAuth } from "./components/AuthContext";
<<<<<<< HEAD
import { ToastProvider } from "./components/ToastContext";
=======
>>>>>>> 644203f (Add password reset, loading states, success page and accessibility improvements)
import { AuthPage } from "./components/AuthPage";
import { SuccessPage } from "./components/SuccessPage";
import { LoadingScreen } from "./components/LoadingScreen";

import './App.css'

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return isAuthenticated ? <SuccessPage /> : <AuthPage />;
};

function App() {
  return (
    <ThemeProvider>
<<<<<<< HEAD
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
=======
      <AuthProvider>
        <AppContent />
      </AuthProvider>
>>>>>>> 644203f (Add password reset, loading states, success page and accessibility improvements)
    </ThemeProvider>
  )
}

export default App
