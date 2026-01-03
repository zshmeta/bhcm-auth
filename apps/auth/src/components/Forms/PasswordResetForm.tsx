import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Button, TextField } from "@repo/ui";
import { createAuthClient, ApiError } from "../../lib/api-client";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const InfoMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(63, 140, 255, 0.08);
  border: 1px solid rgba(63, 140, 255, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: ${({ theme }) => theme.typography.lineHeights.normal};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &::before {
    content: "←";
    font-size: 18px;
  }
`;

export interface PasswordResetFormProps {
  onBackToLogin?: () => void;
}

export const PasswordResetForm = ({ onBackToLogin }: PasswordResetFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { showSuccess, showError } = useToast();
  const authClient = createAuthClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.requestPasswordReset({ email: email.trim() });
      setEmailSent(true);
      showSuccess(
        "If an account exists with that email, we've sent password reset instructions. Please check your inbox and spam folder.",
        "Email Sent"
      );
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "NETWORK_ERROR":
            showError("Network error. Please check your connection and try again.", "Connection Error");
            break;
          default:
            // For security, always show success
            setEmailSent(true);
            showSuccess(
              "If an account exists with that email, we've sent password reset instructions.",
              "Email Sent"
            );
        }
      } else {
        showError(err instanceof Error ? err.message : "Failed to send reset email.", "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {onBackToLogin && (
        <BackButton type="button" onClick={onBackToLogin} disabled={loading}>
          Back to Sign In
        </BackButton>
      )}

      <InfoMessage>
        Enter your email address and we'll send you a link to reset your password.
      </InfoMessage>

      <Tooltip content="We'll send a secure link to this email address" placement="top">
        <EmailInput
          id="email"
          label="Email Address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || emailSent}
          autoComplete="email"
          autoFocus
          showValidation
        />
      </Tooltip>

      <Button type="submit" disabled={loading || emailSent} loading={loading} fullWidth size="lg">
        {loading ? "Sending..." : emailSent ? "Email Sent" : "Send Reset Link"}
      </Button>

      {emailSent && onBackToLogin && (
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          fullWidth
          size="lg"
        >
          Return to Sign In
        </Button>
      )}
    </Form>
  );
};

export default PasswordResetForm;
