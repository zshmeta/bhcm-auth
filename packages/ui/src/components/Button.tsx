import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styled, { css, type DefaultTheme } from "styled-components";

type ButtonVariant = "primary" | "secondary" | "outline" | "subtle" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: ReactNode;
}

const buttonVariants = (theme: DefaultTheme) => ({
	primary: css`
		background: ${theme.gradients.primary};
		color: ${theme.colors.text.onAccent};
		box-shadow: ${theme.shadows.soft};
		&:hover {
			filter: brightness(1.05);
		}
		&:active {
			filter: brightness(0.95);
		}
	`,
	secondary: css`
		background: ${theme.colors.backgrounds.elevated};
		color: ${theme.colors.primaryHover};
		border: 1px solid ${theme.colors.border.accent};
		&:hover {
			background: rgba(63, 140, 255, 0.12);
		}
	`,
	outline: css`
		background: transparent;
		color: ${theme.colors.text.primary};
		border: 1px solid rgba(148, 163, 184, 0.4);
		&:hover {
			border-color: ${theme.colors.primary};
			color: ${theme.colors.primaryHover};
			box-shadow: 0 0 0 3px ${theme.colors.focus};
		}
	`,
	subtle: css`
		background: rgba(255, 255, 255, 0.04);
		color: ${theme.colors.text.secondary};
		&:hover {
			background: rgba(255, 255, 255, 0.08);
		}
	`,
	danger: css`
		background: ${theme.gradients.danger};
		color: ${theme.colors.text.onAccent};
		&:hover {
			filter: brightness(1.05);
		}
	`,
});

const buttonSizes = (theme: DefaultTheme) => ({
	sm: css`
		height: 34px;
		padding: 0 ${theme.spacing.sm};
		font-size: ${theme.typography.sizes.sm};
	`,
	md: css`
		height: 40px;
		padding: 0 ${theme.spacing.md};
		font-size: ${theme.typography.sizes.base};
	`,
	lg: css`
		height: 48px;
		padding: 0 ${theme.spacing.lg};
		font-size: ${theme.typography.sizes.md};
		letter-spacing: 0.01em;
	`,
});

const StyledButton = styled.button<{ variant: ButtonVariant; size: ButtonSize }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing.xs};
	border: none;
	border-radius: ${({ theme }) => theme.radii.md};
	cursor: pointer;
	font-family: ${({ theme }) => theme.typography.fontFamily};
	font-weight: ${({ theme }) => theme.typography.weightSemiBold};
	line-height: 1;
	transition: ${({ theme }) => theme.transitions.base};
	position: relative;
	overflow: hidden;
	isolation: isolate;

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
		box-shadow: none;
	}

	&:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus}, inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}

	${({ theme, size }) => {
		const sizes = buttonSizes(theme);
		return sizes[size] || sizes.md;
	}}

	${({ theme, variant }) => {
		const variants = buttonVariants(theme);
		return variants[variant] || variants.primary;
	}}

	&::after {
		content: "";
		position: absolute;
		inset: -120%;
		background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.25), transparent 70%);
		transform: translateX(-100%);
		transition: transform 400ms ease;
	}

	&:hover::after {
		transform: translateX(120%);
	}
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, variant = "primary", size = "md", icon, ...props }, ref) => (
		<StyledButton ref={ref} variant={variant} size={size} {...props}>
			{icon && <span aria-hidden>{icon}</span>}
			{children}
		</StyledButton>
	)
);

Button.displayName = "Button";

export default Button;
