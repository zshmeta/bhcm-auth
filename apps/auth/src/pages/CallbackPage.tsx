import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader, Notification } from "@repo/ui";
import { getSafeReturnTo } from "../lib/redirectUtils";

// OAuth / external provider callbacks can land here.
// We currently just normalize the redirect target and forward.
export default function CallbackPage() {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		// We only allow relative, same-app redirects.
		const returnTo = getSafeReturnTo(new URLSearchParams(location.search));
		navigate(returnTo, { replace: true });
	}, [location.search, navigate]);

	return (
		<Card>
			<CardHeader>Completing sign-in</CardHeader>
			<CardBody>
				<Notification variant="info" title="Redirecting…" />
			</CardBody>
		</Card>
	);
}
