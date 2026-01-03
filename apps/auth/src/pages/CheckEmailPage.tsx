/**
 * Check Your Email Page
 *
 * Displayed after successful registration to prompt email verification.
 * Provides option to resend verification email.
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Button, Text, Notification } from "@repo/ui";
// TODO: Uncomment when resend verification API is implemented
// import { authApi } from "../auth/auth.api.js";
import { AuthShell } from "../components/AuthShell.js";

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const float = keyframes`
	0%, 100% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-10px);
	}
`;

const IconWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmailIcon = styled.div`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: ${({ theme }) => theme.gradients.primarySoft};
	display: flex;
	align-items: center;
	justify-content: center;
	animation: ${float} 3s ease-in-out infinite;

	svg {
		width: 40px;
		height: 40px;
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const Content = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
	text-align: center;
`;

const EmailHighlight = styled.span`
	color: ${({ theme }) => theme.colors.primary};
	font-weight: ${({ theme }) => theme.typography.weightSemiBold};
`;

const Actions = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.md};
`;

const Footer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.lg};
	padding-top: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
	text-align: center;
`;

const ResendInfo = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing.xs};
`;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const MailIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
		<polyline points="22,6 12,13 2,6" />
	</svg>
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESEND_COOLDOWN_SECONDS = 60;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckEmailPage() {
	const location = useLocation();
	const navigate = useNavigate();

	// Get email from navigation state
	const email = (location.state as { email?: string })?.email ?? "";

	const [resendCooldown, setResendCooldown] = useState(0);
	const [resendLoading, setResendLoading] = useState(false);
	const [notification, setNotification] = useState<{
		type: "success" | "danger";
		message: string;
	} | null>(null);

	// Redirect if no email in state
	useEffect(() => {
		if (!email) {
			navigate("/register", { replace: true });
		}
	}, [email, navigate]);

	// Countdown timer for resend cooldown
	useEffect(() => {
		if (resendCooldown <= 0) return;

		const timer = setInterval(() => {
			setResendCooldown((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [resendCooldown]);

	const handleResendEmail = async () => {
		if (resendCooldown > 0 || resendLoading) return;

		setResendLoading(true);
		setNotification(null);

		try {
			// TODO: Implement actual resend API call
			// await authApi.resendVerificationEmail({ email });

			// For now, simulate success
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setNotification({
				type: "success",
				message: "Verification email sent! Please check your inbox.",
			});
			setResendCooldown(RESEND_COOLDOWN_SECONDS);
		} catch (err) {
			setNotification({
				type: "danger",
				message: err instanceof Error ? err.message : "Failed to resend email",
			});
		} finally {
			setResendLoading(false);
		}
	};

	const handleChangeEmail = () => {
		navigate("/register", { replace: true });
	};

	// Mask email for privacy
	const maskedEmail = email
		? email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, end) =>
				`${start}${"•".repeat(Math.min(middle.length, 5))}${end}`
			)
		: "";

	return (
		<AuthShell title="Check your email" subtitle="Verification required">
			<IconWrapper>
				<EmailIcon>
					<MailIcon />
				</EmailIcon>
			</IconWrapper>

			{notification && (
				<Notification
					variant={notification.type}
					title={notification.type === "success" ? "Email sent" : "Error"}
					message={notification.message}
					onClose={() => setNotification(null)}
				/>
			)}

			<Content>
				<Text color="secondary">
					We've sent a verification link to
				</Text>
				<Text variant="h4">
					<EmailHighlight>{maskedEmail || email}</EmailHighlight>
				</Text>
				<Text color="tertiary" variant="body">
					Click the link in your email to verify your account.
					The link will expire in 24 hours.
				</Text>
			</Content>

			<Actions>
				<Button
					variant="secondary"
					fullWidth
					onClick={handleResendEmail}
					loading={resendLoading}
					disabled={resendCooldown > 0}
				>
					{resendCooldown > 0
						? `Resend in ${resendCooldown}s`
						: "Resend verification email"}
				</Button>

				<Button
					variant="ghost"
					fullWidth
					onClick={handleChangeEmail}
				>
					Use a different email
				</Button>
			</Actions>

			<Footer>
				<ResendInfo>
					<Text variant="caption" color="tertiary">
						Didn't receive it? Check your spam folder or
					</Text>
				</ResendInfo>
				<Text variant="caption" color="tertiary">
					<Link to="/support">contact support</Link> for help.
				</Text>
			</Footer>
		</AuthShell>
	);
}

export default CheckEmailPage;
