import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Notification } from "@repo/ui";

export type ErrorPageKind = "not_found" | "unexpected";

export default function ErrorPage({ kind = "unexpected" }: { kind?: ErrorPageKind }) {
	const navigate = useNavigate();

	const message =
		kind === "not_found"
			? "That page does not exist."
			: "Something went wrong. Please try again.";

	return (
		<Card>
			<CardHeader>Auth</CardHeader>
			<CardBody>
				<Notification variant="danger" title="Error" message={message} />
				<div style={{ marginTop: 16, display: "flex", gap: 12 }}>
					<Button type="button" onClick={() => navigate("/auth", { replace: true })}>
						Go to login
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}
