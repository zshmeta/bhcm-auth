import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Button, EmailInput, PasswordInput } from "@repo/ui";
import { createAuthClient, type RegisterRequest, ApiError } from "../../lib/api-client";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const PasswordStrength = styled.div<{ $strength: number }>`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ $strength, theme }) => {
    if ($strength === 0) return theme.colors.text.muted;
    if ($strength <= 1) return theme.colors.status.danger;
    if ($strength === 2) return theme.colors.warning;
    return theme.colors.status.success;
  }};
  line-height: ${({ theme }) => theme.typography.lineHeights.snug};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border.subtle};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TermsText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.weightMedium};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const calculatePasswordStrength = (password: string): number => {
  if (password.length === 0) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return Math.min(3, Math.floor(strength / 2));
};

const getPasswordHintText = (strength: number, showStrength: boolean): string => {
  if (!showStrength) return "";
  if (strength === 0) return "";
  if (strength === 1) return "Weak password - add uppercase, numbers, or symbols";
  if (strength === 2) return "Good password - consider adding more complexity";
  return "Strong password";
};

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const authClient = createAuthClient();

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError("Passwords do not match", "Validation Error");
      return;
    }

    if (password.length < 8) {
      showError("Password must be at least 8 characters long", "Validation Error");
      return;
    }

    if (passwordStrength < 1) {
      showError("Password is too weak. Please use a stronger password.", "Weak Password");
      return;
    }

    setLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: email.trim(),
        password,
        issueSession: true,
      };

      const result = await authClient.register(registerData);

      if ("tokens" in result) {
        login(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      }

      showSuccess("Registration successful! Redirecting...", "Welcome");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "EMAIL_ALREADY_REGISTERED":
            showError("This email is already registered. Please sign in instead.", "Email Already Exists");
            break;
          case "NETWORK_ERROR":
            showError("Network error. Please check your connection and try again.", "Connection Error");
            break;
          default:
            showError("Registration failed. Please try again.", "Error");
        }
      } else {
        showError(err instanceof Error ? err.message : "Registration failed. Please try again.", "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <EmailInput
          id="email"
          label="Email Address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
          autoFocus
          showValidation
        />

        <div>
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
            showStrength
            helpText="Minimum 8 characters"
          />
          {password && passwordStrength > 0 && (
            <PasswordStrength $strength={passwordStrength}>
              {getPasswordHintText(passwordStrength, true)}
            </PasswordStrength>
          )}
        </div>

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
          error={
            confirmPassword && password !== confirmPassword
              ? "Passwords do not match"
              : undefined
          }
        />
      </InputGroup>

      <TermsText>
        By creating an account, you agree to our{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
      </TermsText>

      <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg">
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      {onSwitchToLogin && (
        <>
          <Divider>or</Divider>
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToLogin}
            disabled={loading}
            fullWidth
            size="lg"
          >
            Sign In to Existing Account
          </Button>
        </>
      )}
    </Form>
  );
};

export default RegisterForm;
