
import { RequireAuth, RequireAuthProps } from "./RequireAuth.js";
import React from "react";


export function withAuth<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	options?: Omit<RequireAuthProps, "children">
) {
	return function AuthenticatedComponent(props: P) {
		return (
			<RequireAuth {...options}>
				<WrappedComponent {...props} />
			</RequireAuth>
		);
	};
}
