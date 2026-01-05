/**
 * RequireAuth Guard
 *
 * A route guard component that ensures the user is authenticated
 * before rendering protected content. Redirects to login if not authenticated.
 */

import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader } from "@repo/ui";
import { useAuth } from "../../auth/auth.hooks.js";
import styled from "styled-components";

interface RequireAuthProps {
	/** Content to render when authenticated */
	children: ReactNode;
	/** Roles that are allowed to access this route */
	allowedRoles?: string[];
	/** Where to redirect if not authenticated */
	redirectTo?: string;
	/** Custom loading component */
	loadingFallback?: ReactNode;
}

/**
 * Protects routes that require authentication.
 *
 * Usage:
 * ```tsx
 * <Route
 *   path="/sessions"
 *   element={
 *     <RequireAuth>
 *       <SessionsPage />
 *     </RequireAuth>
 *   }
 * />
 * ```
 */



const LoadingWrapper = styled.div`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${({ theme }) => theme.colors.backgrounds.app};
`;


export function RequireAuth({
	children,
	allowedRoles,
	redirectTo = "/login",
	loadingFallback,
}: RequireAuthProps) {
	const { isAuthenticated, loading, user } = useAuth();
	const location = useLocation();

	// Show loading state while checking auth status
	if (loading) {
		return (
			<LoadingWrapper>
				{loadingFallback || <Loader size="lg" />}
			</LoadingWrapper>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		// Preserve the intended destination for redirect after login
		const returnTo = location.pathname + location.search;
		const loginUrl = `${redirectTo}?returnTo=${encodeURIComponent(returnTo)}`;

		return <Navigate to={loginUrl} replace />;
	}

	// Check role-based access if roles are specified
	if (allowedRoles && allowedRoles.length > 0 && user) {
		if (!allowedRoles.includes(user.role)) {
			// User doesn't have required role - redirect to unauthorized page or home
			return <Navigate to="/unauthorized" replace />;
		}
	}

	// User is authenticated (and has required role if specified)
	return <>{children}</>;
}

/**
 * Higher-order component version for class components or complex scenarios.
 */


// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------


export default RequireAuth;
