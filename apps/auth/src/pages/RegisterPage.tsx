/**
 * Multi-Step Registration Page
 *
 * Enterprise-grade registration flow with:
 * - Step 1: Account credentials (email + password)
 * - Step 2: Profile information (name, phone - optional)
 * - Step 3: Terms acceptance
 * - Redirect to email verification or target app
 */

import { useMemo, useState, useCallback, type FormEvent, type ChangeEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
	Button,
	EmailInput,
	PasswordInput,
	TextField,
	PhoneInput,
	Checkbox,
	Notification,
	Text,
	Stepper,
} from "@repo/ui";
import { useAuth } from "../auth/auth.hooks.js";
import { authApi } from "../auth/auth.api.js";
import { AuthShell } from "../components/AuthShell.js";
import { isAcceptablePassword, isLikelyEmail } from "../lib/validation.js";
import { resolveReturnTo } from "../lib/redirectUtils.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
	// Step 1: Account
	email: string;
	password: string;
	confirmPassword: string;
	// Step 2: Profile (optional)
	firstName: string;
	lastName: string;
	phone: string;
	// Step 3: Terms
	acceptTerms: boolean;
	acceptPrivacy: boolean;
	acceptMarketing: boolean;
}

type StepId = 0 | 1 | 2;

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
`;

const FieldRow = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: ${({ theme }) => theme.spacing.md};

	@media (max-width: 480px) {
		grid-template-columns: 1fr;
	}
`;

const StepperWrapper = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ButtonRow = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing.md};
	margin-top: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
`;

const LegalLink = styled.a`
	color: ${({ theme }) => theme.colors.primary};
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;

const FooterLinks = styled.div`
	margin-top: ${({ theme }) => theme.spacing.md};
	display: flex;
	justify-content: center;
`;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
	{ label: "Account", description: "Email & password" },
	{ label: "Profile", description: "Your details" },
	{ label: "Terms", description: "Accept policies" },
];

const INITIAL_FORM_DATA: FormData = {
	email: "",
	password: "",
	confirmPassword: "",
	firstName: "",
	lastName: "",
	phone: "",
	acceptTerms: false,
	acceptPrivacy: false,
	acceptMarketing: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildLink(path: string, returnTo?: string): string {
	if (!returnTo) return path;
	return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}

// ---------------------------------------------------------------------------
// Step Components
// ---------------------------------------------------------------------------

interface StepProps {
	data: FormData;
	onChange: (field: keyof FormData, value: string | boolean) => void;
	loading: boolean;
	error: string | null;
}

/** Step 1: Account credentials */
function AccountStep({ data, onChange, loading }: StepProps) {
	return (
		<>
			<EmailInput
				label="Email address"
				value={data.email}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("email", e.target.value)}
				placeholder="you@example.com"
				autoComplete="email"
				autoCapitalize="none"
				spellCheck={false}
				autoFocus
				required
				disabled={loading}
				showValidation
			/>

			<PasswordInput
				label="Password"
				value={data.password}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("password", e.target.value)}
				placeholder="Minimum 12 characters"
				helpText="Use uppercase, lowercase, numbers, and symbols for a strong password."
				autoComplete="new-password"
				showStrength
				required
				disabled={loading}
			/>

			<PasswordInput
				label="Confirm password"
				value={data.confirmPassword}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("confirmPassword", e.target.value)}
				placeholder="Re-enter your password"
				autoComplete="new-password"
				required
				disabled={loading}
				error={
					data.confirmPassword && data.password !== data.confirmPassword
						? "Passwords do not match"
						: undefined
				}
			/>
		</>
	);
}

/** Step 2: Profile information */
function ProfileStep({ data, onChange, loading }: StepProps) {
	return (
		<>
			<Text color="secondary" variant="body">
				Help us personalize your experience. These fields are optional.
			</Text>

			<FieldRow>
				<TextField
					label="First name"
					value={data.firstName}
					onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("firstName", e.target.value)}
					placeholder="John"
					autoComplete="given-name"
					disabled={loading}
				/>

				<TextField
					label="Last name"
					value={data.lastName}
					onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("lastName", e.target.value)}
					placeholder="Doe"
					autoComplete="family-name"
					disabled={loading}
				/>
			</FieldRow>

			<PhoneInput
				label="Phone number"
				value={data.phone}
				onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("phone", e.target.value)}
				placeholder="+1 (555) 123-4567"
				autoComplete="tel"
				disabled={loading}
				helpText="Optional. Used for account recovery and notifications."
			/>
		</>
	);
}

/** Step 3: Terms acceptance */
function TermsStep({ data, onChange, loading }: StepProps) {
	return (
		<>
			<Text color="secondary" variant="body">
				Please review and accept our policies to continue.
			</Text>

			<CheckboxGroup>
				<Checkbox
					checked={data.acceptTerms}
					onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("acceptTerms", e.target.checked)}
					disabled={loading}
					label={
						<>
							I agree to the{" "}
							<LegalLink href="/legal/terms" target="_blank" rel="noopener noreferrer">
								Terms of Service
							</LegalLink>{" "}
							<Text as="span" color="danger">*</Text>
						</>
					}
				/>

				<Checkbox
					checked={data.acceptPrivacy}
					onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("acceptPrivacy", e.target.checked)}
					disabled={loading}
					label={
						<>
							I have read the{" "}
							<LegalLink href="/legal/privacy" target="_blank" rel="noopener noreferrer">
								Privacy Policy
							</LegalLink>{" "}
							<Text as="span" color="danger">*</Text>
						</>
					}
				/>

				<Checkbox
					checked={data.acceptMarketing}
					onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("acceptMarketing", e.target.checked)}
					disabled={loading}
					label="I'd like to receive product updates and marketing emails (optional)"
				/>
			</CheckboxGroup>

			<Text variant="caption" color="tertiary">
				By creating an account, you acknowledge that your data will be processed in accordance
				with our privacy policy. You can withdraw consent at any time.
			</Text>
		</>
	);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RegisterPage() {
	const { register, loading, error, clearError } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Return URL handling
	const safeReturnTo = useMemo(
		() => resolveReturnTo(new URLSearchParams(location.search)),
		[location.search]
	);
	const returnTo = safeReturnTo?.value;

	// Form state
	const [currentStep, setCurrentStep] = useState<StepId>(0);
	const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
	const [localError, setLocalError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Update form field
	const handleFieldChange = useCallback((field: keyof FormData, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setLocalError(null);
		clearError();
	}, [clearError]);

	// Validation per step
	const validateStep = useCallback((step: StepId): string | null => {
		switch (step) {
			case 0:
				if (!isLikelyEmail(formData.email)) {
					return "Please enter a valid email address";
				}
				if (!isAcceptablePassword(formData.password)) {
					return "Password must be at least 12 characters";
				}
				if (formData.password !== formData.confirmPassword) {
					return "Passwords do not match";
				}
				return null;
			case 1:
				// Profile step is optional, always valid
				return null;
			case 2:
				if (!formData.acceptTerms) {
					return "You must accept the Terms of Service";
				}
				if (!formData.acceptPrivacy) {
					return "You must acknowledge the Privacy Policy";
				}
				return null;
			default:
				return null;
		}
	}, [formData]);

	// Check if current step is valid
	const isCurrentStepValid = useCallback(() => {
		return validateStep(currentStep) === null;
	}, [currentStep, validateStep]);

	// Navigate between steps
	const goToNextStep = useCallback(() => {
		const validationError = validateStep(currentStep);
		if (validationError) {
			setLocalError(validationError);
			return;
		}

		if (currentStep < 2) {
			setCurrentStep((prev) => (prev + 1) as StepId);
			setLocalError(null);
		}
	}, [currentStep, validateStep]);

	const goToPreviousStep = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => (prev - 1) as StepId);
			setLocalError(null);
		}
	}, [currentStep]);

	// Handle final submission
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Validate final step
		const validationError = validateStep(currentStep);
		if (validationError) {
			setLocalError(validationError);
			return;
		}

		setIsSubmitting(true);
		setLocalError(null);
		clearError();

		try {
			// Register the user
			await register({
				email: formData.email,
				password: formData.password,
				issueSession: true,
			});

			// TODO: Save profile data (firstName, lastName, phone) via separate API call
			// await authApi.updateProfile({ firstName, lastName, phone });

			// Handle redirect based on returnTo
			if (safeReturnTo?.kind === "absolute") {
				try {
					const { code } = await authApi.generateAuthCode({ targetUrl: safeReturnTo.value });
					const url = new URL(safeReturnTo.value);
					url.searchParams.set("code", code);
					window.location.replace(url.toString());
					return;
				} catch (handoffError) {
					console.error("Handoff failed", handoffError);
					// Navigate to check-email page or dashboard
					navigate("/check-email", { replace: true, state: { email: formData.email } });
				}
			} else {
				// Navigate to check-email page to prompt verification
				navigate("/check-email", { replace: true, state: { email: formData.email } });
			}
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : "Registration failed. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle step click (for going back)
	const handleStepClick = useCallback((stepIndex: number) => {
		if (stepIndex < currentStep) {
			setCurrentStep(stepIndex as StepId);
		}
	}, [currentStep]);

	const displayError = error || localError;
	const isLoading = loading || isSubmitting;

	return (
		<AuthShell
			title="Create account"
			subtitle={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
		>
			<StepperWrapper>
				<Stepper
					steps={STEPS}
					currentStep={currentStep}
					variant="compact"
					onStepClick={handleStepClick}
					allowBackNavigation
				/>
			</StepperWrapper>

			{displayError && (
				<Notification
					variant="danger"
					title="Unable to continue"
					message={displayError}
					onClose={() => {
						setLocalError(null);
						clearError();
					}}
				/>
			)}

			<Form onSubmit={handleSubmit}>
				{/* Render current step */}
				{currentStep === 0 && (
					<AccountStep
						data={formData}
						onChange={handleFieldChange}
						loading={isLoading}
						error={displayError}
					/>
				)}
				{currentStep === 1 && (
					<ProfileStep
						data={formData}
						onChange={handleFieldChange}
						loading={isLoading}
						error={displayError}
					/>
				)}
				{currentStep === 2 && (
					<TermsStep
						data={formData}
						onChange={handleFieldChange}
						loading={isLoading}
						error={displayError}
					/>
				)}

				{/* Navigation buttons */}
				<ButtonRow>
					{currentStep > 0 && (
						<Button
							type="button"
							variant="secondary"
							onClick={goToPreviousStep}
							disabled={isLoading}
						>
							Back
						</Button>
					)}

					{currentStep < 2 ? (
						<Button
							type="button"
							variant="primary"
							fullWidth={currentStep === 0}
							onClick={goToNextStep}
							disabled={isLoading || !isCurrentStepValid()}
						>
							Continue
						</Button>
					) : (
						<Button
							type="submit"
							variant="primary"
							fullWidth
							loading={isLoading}
							disabled={isLoading || !isCurrentStepValid()}
						>
							Create account
						</Button>
					)}
				</ButtonRow>
			</Form>

			<FooterLinks>
				<Text color="secondary">
					Already have an account?{" "}
					<Link to={buildLink("/login", returnTo)}>Sign in</Link>
				</Text>
			</FooterLinks>
		</AuthShell>
	);
}

export default RegisterPage;
