import { type ReactNode } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { Loader, Page404 } from "@repo/ui";
import { LoginPage } from "../components/Forms/LoginForm";
// Use new multi-step registration
import { RegisterPage } from "../pages/RegisterPage";
import { CheckEmailPage } from "../pages/CheckEmailPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";
import { SecurityPage } from "../pages/SecurityPage";
import ForgotPasswordPage from "../components/Forms/ForgotPasswordForm";
import ResetPasswordPage from "../components/Forms/ResetPasswordForm";
import SessionsPage from "../components/Forms/SessionsForm";
import { RequireAuth } from "../components/guards/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    errorElement: <Page404 videoSrc="/404.mp4" />,
    children: [
      // Default redirect
      { index: true, element: <Navigate to="/login" replace /> },

      // Public authentication flows
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },

      // Email verification (can be accessed without full auth)
      { path: "check-email", element: <CheckEmailPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },

      // Protected routes - require authentication
      {
        path: "sessions",
        element: (
          <RequireAuth>
            <SessionsPage />
          </RequireAuth>
        ),
      },
      {
        path: "security",
        element: (
          <RequireAuth>
            <SecurityPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);

export function AppRouter({ fallback }: { fallback?: ReactNode }) {
  return <RouterProvider router={router} fallbackElement={fallback ?? <Loader />} />;
}
