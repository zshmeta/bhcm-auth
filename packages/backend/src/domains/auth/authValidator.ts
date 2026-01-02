/* Validation placeholders. When we pick a library (Zod/Valibot/JSON schema),
	 we'll replace these with concrete schemas and parse functions. */

export type LoginBody = { email: string; password: string };
export const validateLogin = (body: unknown): LoginBody => {
	const b = body as Partial<LoginBody>;
	if (!b?.email || !b?.password) throw new Error("validation_error: email and password required");
	return { email: String(b.email), password: String(b.password) };
};

