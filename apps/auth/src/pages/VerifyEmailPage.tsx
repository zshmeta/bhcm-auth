/**
 * Verify Email Page
 *
 * Handles email verification token from the link sent to user's email.
 * Shows success/error states and provides next steps.
 */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Button, Text, Loader } from "@repo/ui";
import { AuthShell } from "../components/AuthShell.js";

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const bounce = keyframes`
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
`;

const IconWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatusIcon = styled.div<{ $status: "loading" | "success" | "error" }>`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;

	${({ theme, $status }) => {
		switch ($status) {
			case "success":
				return `
					background: ${theme.colors.status.success}22;
					color: ${theme.colors.status.success};
					animation: ${bounce} 0.5s ease-out;
				`;
			case "error":
				return `
					background: ${theme.colors.status.danger}22;
					color: ${theme.colors.status.danger};
				`;
			default:
				return `
					background: ${theme.colors.backgrounds.elevated};
					color: ${theme.colors.primary};
				`;
		}
	}}

	svg {
		width: 40px;
		height: 40px;
	}
`;

const Content = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
	text-align: center;
`;

const Actions = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.md};
`;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const CheckIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

const XIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerificationStatus = "loading" | "success" | "error" | "expired" | "already-verified";

interface VerificationState {
	status: VerificationStatus;
	message: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VerifyEmailPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const token = searchParams.get("token");
	const returnTo = searchParams.get("returnTo");

	const [state, setState] = useState<VerificationState>({
		status: "loading",
		message: "Verifying your email...",
	});

	const verifyEmail = useCallback(async () => {
		if (!token) {
			setState({
				status: "error",
				message: "Invalid verification link. Please request a new one.",
			});
			return;
		}

		try {
			// TODO: Implement actual verification API call
			// await authApi.verifyEmail({ token });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Simulate success for now - in production, status comes from API
			// Possible statuses: "success" | "expired" | "already-verified" | "error"
			setState({
				status: "success",
				message: "Your email has been verified successfully!",
			});

			// For testing other states, uncomment one of these:
			// setState({ status: "expired", message: "This verification link has expired. Please request a new one." });
			// setState({ status: "already-verified", message: "Your email has already been verified." });
			// setState({ status: "error", message: "Verification failed. Please try again." });
		} catch (err) {
			setState({
				status: "error",
				message: err instanceof Error ? err.message : "Failed to verify email. Please try again.",
			});
		}
	}, [token]);

	useEffect(() => {
		verifyEmail();
	}, [verifyEmail]);

	const handleContinue = () => {
		if (returnTo) {
			window.location.replace(returnTo);
		} else {
			navigate("/login", { replace: true });
		}
	};

	const handleRequestNewLink = () => {
		navigate("/forgot-password", { replace: true });
	};

	const handleLogin = () => {
		navigate("/login", { replace: true });
	};

	const getTitle = () => {
		switch (state.status) {
			case "success":
				return "Email verified!";
			case "expired":
				return "Link expired";
			case "already-verified":
				return "Already verified";
			case "error":
				return "Verification failed";
			default:
				return "Verifying...";
		}
	};

	const getSubtitle = () => {
		switch (state.status) {
			case "success":
				return "Your account is ready";
			case "loading":
				return "Please wait";
			default:
				return "Something went wrong";
		}
	};

	const renderIcon = () => {
		if (state.status === "loading") {
			return <Loader size="lg" />;
		}

		const isSuccess = state.status === "success" || state.status === "already-verified";

		return (
			<StatusIcon $status={isSuccess ? "success" : "error"}>
				{isSuccess ? <CheckIcon /> : <XIcon />}
			</StatusIcon>
		);
	};

	const renderActions = () => {
		switch (state.status) {
			case "loading":
				return null;

			case "success":
				return (
					<Actions>
						<Button variant="primary" fullWidth onClick={handleContinue}>
							{returnTo ? "Continue to app" : "Sign in"}
						</Button>
					</Actions>
				);

			case "already-verified":
				return (
					<Actions>
						<Button variant="primary" fullWidth onClick={handleLogin}>
							Sign in
						</Button>
					</Actions>
				);

			case "expired":
				return (
					<Actions>
						<Button variant="primary" fullWidth onClick={handleRequestNewLink}>
							Request new link
						</Button>
						<Button variant="ghost" fullWidth onClick={handleLogin}>
							Back to sign in
						</Button>
					</Actions>
				);

			case "error":
			default:
				return (
					<Actions>
						<Button variant="secondary" fullWidth onClick={() => verifyEmail()}>
							Try again
						</Button>
						<Button variant="ghost" fullWidth onClick={handleLogin}>
							Back to sign in
						</Button>
					</Actions>
				);
		}
	};

	return (
		<AuthShell title={getTitle()} subtitle={getSubtitle()}>
			<IconWrapper>
				{renderIcon()}
			</IconWrapper>

			<Content>
				<Text color={state.status === "loading" ? "tertiary" : "secondary"}>
					{state.message}
				</Text>

				{state.status === "success" && (
					<Text variant="caption" color="tertiary">
						You can now access all features of your account.
					</Text>
				)}
			</Content>

			{renderActions()}
		</AuthShell>
	);
}

export default VerifyEmailPage;
