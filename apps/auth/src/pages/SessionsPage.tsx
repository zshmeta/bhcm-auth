import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Button, Card, CardBody, CardHeader, Loader, Notification, Table } from "@repo/ui";
import { useAuth } from "../components/AuthContext";
import { authApi } from "../lib/authApi";

const Page = styled.div`
	width: 100%;
	max-width: 960px;
	margin: 0 auto;
	padding: ${({ theme }) => theme.spacing.xl};
`;

// This page provides basic session visibility and revocation.
// It is security-sensitive: keep messages generic and avoid leaking token details.
export default function SessionsPage() {
	const { user, session, logout, setSessionFromRefresh } = useAuth();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sessions, setSessions] = useState<
		Array<{ id: string; createdAt: string; lastSeenAt: string; expiresAt: string }>
	>([]);

	const currentUserId = user?.id;

	const load = async () => {
		if (!currentUserId) return;
		setError(null);
		setLoading(true);

		try {
			// Refresh once before listing sessions so access token is up-to-date.
			// This reduces “mysterious 401s” on fresh page loads.
			await setSessionFromRefresh();

			const result = await authApi.listSessions({ userId: currentUserId });
			setSessions(
				result.sessions.map((s) => ({
					id: s.id,
					createdAt: s.createdAt,
					lastSeenAt: s.lastSeenAt,
					expiresAt: s.expiresAt,
				})),
			);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load sessions");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUserId]);

	const rows = useMemo(
		() =>
			sessions.map((s) => ({
				...s,
				isCurrent: Boolean(session?.id && session.id === s.id),
			})),
		[sessions, session?.id],
	);

	const revoke = async (sessionId: string) => {
		if (!user) return;
		setError(null);

		try {
			await authApi.logout({ sessionId, userId: user.id, reason: "manual" });

			// If the user revoked their current session, treat it as a logout.
			if (session?.id === sessionId) {
				logout();
				return;
			}

			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to revoke session");
		}
	};

	const revokeAll = async () => {
		if (!user) return;
		setError(null);

		try {
			await authApi.logoutAll({
				userId: user.id,
				excludeSessionId: session?.id,
				reason: "logout_all",
			});
			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to revoke sessions");
		}
	};

	return (
		<Page>
			<Card>
				<CardHeader>Active sessions</CardHeader>
				<CardBody>
					{error && <Notification variant="danger" title="Unable to load sessions" message={error} />}

					{loading ? (
						<Loader />
					) : (
						<>
							<div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
								<Button type="button" variant="secondary" onClick={() => void load()}>
									Refresh
								</Button>
								<Button type="button" variant="danger" onClick={() => void revokeAll()}>
									Log out other sessions
								</Button>
							</div>

							{/* Keep the table surface simple and readable. */}
							<Table
								columns={[
									{ header: "Session", accessor: "id" },
									{ header: "Created", accessor: "createdAt" },
									{ header: "Last seen", accessor: "lastSeenAt" },
									{ header: "Expires", accessor: "expiresAt" },
								]}
								data={rows}
								renderRowActions={(row) => (
									<div style={{ display: "flex", gap: 8 }}>
										{row.isCurrent ? (
											<Button type="button" variant="outline" onClick={() => void revoke(row.id)}>
												Log out
											</Button>
										) : (
											<Button type="button" variant="ghost" onClick={() => void revoke(row.id)}>
												Revoke
											</Button>
										)}
									</div>
								)}
							/>
						</>
					)}
				</CardBody>
			</Card>
		</Page>
	);
}
