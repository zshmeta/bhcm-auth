import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Button, EmailInput, PasswordInput } from "@repo/ui";
import { createAuthClient, type LoginRequest, ApiError } from "../../lib/api-client";
import { useAuth } from "../AuthContext";
import { useToast } from "../ToastContext";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const ForgotPasswordLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  padding: 0;
  text-align: right;
  transition: color 0.2s ease;
  margin-top: -${({ theme }) => theme.spacing.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
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

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToSignup, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const authClient = createAuthClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData: LoginRequest = {
        email: email.trim(),
        password,
      };

      const result = await authClient.login(loginData);
      login(result.user, result.tokens.accessToken, result.tokens.refreshToken);

      showSuccess("Login successful! Redirecting...", "Welcome back");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "INVALID_CREDENTIALS":
            showError("Invalid email or password. Please try again.", "Login Failed");
            break;
          case "USER_NOT_ACTIVE":
            showError("Your account is not active. Please verify your email.", "Account Inactive");
            break;
          case "USER_SUSPENDED":
            showError("Your account has been suspended. Please contact support.", "Account Suspended");
            break;
          case "NETWORK_ERROR":
            showError("Network error. Please check your connection and try again.", "Connection Error");
            break;
          default:
            showError("Login failed. Please try again.", "Error");
        }
      } else {
        showError(err instanceof Error ? err.message : "Login failed. Please try again.", "Error");
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

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
        />

        <ForgotPasswordLink type="button" onClick={onForgotPassword} disabled={loading}>
          Forgot password?
        </ForgotPasswordLink>
      </InputGroup>

      <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg">
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      {onSwitchToSignup && (
        <>
          <Divider>or</Divider>
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToSignup}
            disabled={loading}
            fullWidth
            size="lg"
          >
            Create New Account
          </Button>
        </>
      )}
    </Form>
  );
};

export default LoginForm;
