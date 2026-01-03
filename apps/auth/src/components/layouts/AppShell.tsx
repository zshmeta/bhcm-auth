/**
 * App Shell Layout
 * 
 * Layout wrapper for authenticated pages within the auth app.
 * Used for pages like Sessions management, Security settings, etc.
 */

import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Text } from "@repo/ui";
import { useAuth } from "../../auth/auth.hooks.js";

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const Viewport = styled.div`
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: ${({ theme }) => theme.colors.backgrounds.app};
`;

const TopBar = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
	background: ${({ theme }) => theme.colors.backgrounds.surface};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const Logo = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoText = styled.span`
	font-size: ${({ theme }) => theme.typography.sizes.lg};
	font-weight: ${({ theme }) => theme.typography.weightBold};
	background: ${({ theme }) => theme.gradients.primary};
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
`;

const UserSection = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
`;

const UserInfo = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	
	@media (max-width: 600px) {
		display: none;
	}
`;

const Main = styled.main`
	flex: 1;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding: ${({ theme }) => theme.spacing.xl};
`;

const ContentContainer = styled.div`
	width: 100%;
	max-width: 800px;
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login", { replace: true });
		} catch (err) {
			console.error("Logout failed", err);
		}
	};

	return (
		<Viewport>
			<TopBar>
				<Logo>
					<LogoText>BHC Markets</LogoText>
					<Text variant="caption" color="tertiary">
						Security
					</Text>
				</Logo>

				<UserSection>
					{user && (
						<UserInfo>
							<Text variant="body" color="primary">
								{user.email}
							</Text>
							<Text variant="caption" color="tertiary">
								{user.role}
							</Text>
						</UserInfo>
					)}
					<Button variant="ghost" size="sm" onClick={handleLogout}>
						Sign out
					</Button>
				</UserSection>
			</TopBar>

			<Main>
				<ContentContainer>
					{children}
				</ContentContainer>
			</Main>
		</Viewport>
	);
}

export default AppShell;
