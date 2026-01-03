import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import CallbackPage from "./pages/CallbackPage";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage";
import SessionsPage from "./pages/SessionsPage";

// Central route map for the Auth app.
// Keep pages route-level; keep components reusable.
export const router = createBrowserRouter([
	{ path: "/", element: <Navigate to="/auth" replace /> },
	{ path: "/auth", element: <LoginPage /> },
	{ path: "/callback", element: <CallbackPage /> },
	{
		path: "/sessions",
		element: (
			<RequireAuth>
				<SessionsPage />
			</RequireAuth>
		),
	},
	// Back-compat path some older components used.
	{ path: "/app", element: <Navigate to="/sessions" replace /> },
	{ path: "*", element: <ErrorPage kind="not_found" /> },
]);
