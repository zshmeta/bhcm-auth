/**
 * Security Settings Page
 *
 * Allows users to manage their security settings:
 * - Change password
 * - View and revoke sessions
 * - MFA settings (placeholder for future)
 */

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
	Button,
	Card,
	PasswordInput,
	Notification,
	Text,
	Toggle,
} from "@repo/ui";
import { useAuth } from "../auth/auth.hooks.js";
import { authApi } from "../auth/auth.api.js";
import { AppShell } from "../components/layouts/AppShell.js";
import { isAcceptablePassword } from "../lib/validation.js";

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.xl};
`;

const Section = styled.section`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
`;

const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
`;

const ButtonRow = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.sm};
`;

const MfaRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.backgrounds.elevated};
	border-radius: ${({ theme }) => theme.radii.md};
`;

const MfaInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.xxs};
`;

const Badge = styled.span<{ $variant: "success" | "warning" }>`
	display: inline-flex;
	align-items: center;
	padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm}`};
	border-radius: ${({ theme }) => theme.radii.pill};
	font-size: ${({ theme }) => theme.typography.sizes.xs};
	font-weight: ${({ theme }) => theme.typography.weightMedium};
	background: ${({ theme, $variant }) =>
		$variant === "success"
			? `${theme.colors.status.success}22`
			: `${theme.colors.status.warning}22`};
	color: ${({ theme, $variant }) =>
		$variant === "success"
			? theme.colors.status.success
			: theme.colors.status.warning};
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SecurityPage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	// Password change state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [passwordNotification, setPasswordNotification] = useState<{
		type: "success" | "danger";
		message: string;
	} | null>(null);

	// MFA state (placeholder)
	const [mfaEnabled, setMfaEnabled] = useState(false);

	const canChangePassword =
		currentPassword.length > 0 &&
		isAcceptablePassword(newPassword) &&
		newPassword === confirmPassword &&
		!passwordLoading;

	const handlePasswordChange = async (e: FormEvent) => {
		e.preventDefault();

		if (!canChangePassword) return;

		setPasswordLoading(true);
		setPasswordNotification(null);

		try {
			await authApi.changePassword({
				currentPassword,
				newPassword,
			});

			setPasswordNotification({
				type: "success",
				message: "Password changed successfully. You may need to sign in again on other devices.",
			});

			// Clear form
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			setPasswordNotification({
				type: "danger",
				message: err instanceof Error ? err.message : "Failed to change password",
			});
		} finally {
			setPasswordLoading(false);
		}
	};

	const handleMfaToggle = () => {
		// TODO: Implement MFA setup flow
		if (!mfaEnabled) {
			// Would navigate to MFA setup page
			alert("MFA setup will be available soon!");
		} else {
			// Would show disable confirmation
			alert("MFA disable will be available soon!");
		}
	};

	const handleViewSessions = () => {
		navigate("/sessions");
	};

	return (
		<AppShell>
			<PageContainer>
				{/* Page Header */}
				<Section>
					<Text variant="h2">Security Settings</Text>
					<Text color="secondary">
						Manage your account security and authentication preferences.
					</Text>
				</Section>

				{/* Password Section */}
				<Card header="Change Password" variant="elevated" padding="lg">
					{passwordNotification && (
						<Notification
							variant={passwordNotification.type}
							title={passwordNotification.type === "success" ? "Success" : "Error"}
							message={passwordNotification.message}
							onClose={() => setPasswordNotification(null)}
						/>
					)}

					<Form onSubmit={handlePasswordChange}>
						<PasswordInput
							label="Current Password"
							value={currentPassword}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
							placeholder="Enter your current password"
							autoComplete="current-password"
							required
							disabled={passwordLoading}
						/>

						<PasswordInput
							label="New Password"
							value={newPassword}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
							placeholder="Minimum 12 characters"
							helpText="Use uppercase, lowercase, numbers, and symbols."
							autoComplete="new-password"
							showStrength
							required
							disabled={passwordLoading}
						/>

						<PasswordInput
							label="Confirm New Password"
							value={confirmPassword}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
							placeholder="Re-enter new password"
							autoComplete="new-password"
							required
							disabled={passwordLoading}
							error={
								confirmPassword && newPassword !== confirmPassword
									? "Passwords do not match"
									: undefined
							}
						/>

						<ButtonRow>
							<Button
								type="submit"
								variant="primary"
								loading={passwordLoading}
								disabled={!canChangePassword}
							>
								Update Password
							</Button>
						</ButtonRow>
					</Form>
				</Card>

				{/* MFA Section */}
				<Card header="Two-Factor Authentication" variant="elevated" padding="lg">
					<MfaRow>
						<MfaInfo>
							<Text variant="label">Authenticator App</Text>
							<Text color="tertiary" variant="caption">
								Use an app like Google Authenticator or Authy for additional security.
							</Text>
						</MfaInfo>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<Badge $variant={mfaEnabled ? "success" : "warning"}>
								{mfaEnabled ? "Enabled" : "Not enabled"}
							</Badge>
							<Toggle
								checked={mfaEnabled}
								onChange={handleMfaToggle}
								aria-label="Toggle MFA"
							/>
						</div>
					</MfaRow>

					<Text color="tertiary" variant="caption">
						Two-factor authentication adds an extra layer of security to your account by
						requiring a code from your phone in addition to your password.
					</Text>
				</Card>

				{/* Sessions Section */}
				<Card header="Active Sessions" variant="elevated" padding="lg">
					<Text color="secondary">
						View and manage your active sessions across devices.
					</Text>

					<ButtonRow>
						<Button variant="secondary" onClick={handleViewSessions}>
							Manage Sessions
						</Button>
					</ButtonRow>
				</Card>

				{/* Danger Zone */}
				<Card header="Danger Zone" variant="elevated" padding="lg">
					<Text color="danger">
						These actions are irreversible. Please proceed with caution.
					</Text>

					<ButtonRow>
						<Button
							variant="danger"
							onClick={async () => {
								if (window.confirm("Are you sure you want to sign out from all devices?")) {
									try {
										await authApi.logoutAll({
											userId: user?.id || "",
											reason: "manual",
										});
										await logout();
										navigate("/login", { replace: true });
									} catch (err) {
										console.error("Failed to logout all", err);
									}
								}
							}}
						>
							Sign Out All Devices
						</Button>
					</ButtonRow>
				</Card>
			</PageContainer>
		</AppShell>
	);
}

export default SecurityPage;
