import type { HttpRequest, HttpResponse } from "../../api/types.js";
import { validateLogin } from "./authValidator.js";
import type { AuthServiceConfig, AuthService } from "./authService.js";

export const createLoginController = (authService: AuthService) => {
	return async (req: HttpRequest): Promise<HttpResponse> => {
		try {
			const { email, password } = validateLogin(req.body);

			const result = await authService.authenticate({
				email,
				password,
				// Device metadata extraction could go here if we expand HttpRequest type
			});

			return {
				status: 200,
				body: result, // Returns { user, session, tokens }
			};
		} catch (error: any) {
			// Basic error handling mapping; strictly could use a centralized error mapper
			// similar to what's in src/index.ts, but keeping it simple for the controller unit.
			const errorMessage = error.message || "Unknown error";

			if (errorMessage.includes("validation_error")) {
				return { status: 400, body: { error: errorMessage } };
			}

			// AuthErrors from AuthService
			if (["INVALID_CREDENTIALS", "USER_NOT_ACTIVE", "USER_SUSPENDED"].includes(error.code)) {
				return { status: 401, body: { error: error.code } };
			}

			// Fallback
			return { status: 500, body: { error: "internal_error" } };
		}
	};
};
