# BHC Markets Authentication - Style Guide

## Brand Identity

### Mission
To provide institutional-grade trading tools with the sophistication and reliability expected by professional traders and wealth management firms.

### Visual Language
- **Professional**: Clean, structured, no-nonsense design
- **Trustworthy**: Consistent, predictable, secure
- **Modern**: Current technology, forward-thinking
- **Exclusive**: Premium feel, high-end materials

## Color System

### Primary Colors
```css
/* Navy Blue - Primary Brand Color */
--primary: #02173f;
--primary-hover: #283957;
--primary-muted: #1A2F5A;

/* Gold - Accent/Wealth Indicator */
--accent: #E6A135;
--accent-hover: #F0B45F;
```

### Status Colors
```css
/* Success - "In the Green" */
--success: #28A745;

/* Warning - Caution */
--warning: #FFC107;

/* Danger - "In the Red" */
--danger: #DC3545;

/* Info - Primary */
--info: #02173f;
```

### Neutral Colors
```css
/* Text Colors */
--text-primary: #F8F9FA;     /* High contrast */
--text-secondary: #CED4DA;   /* Medium contrast */
--text-tertiary: #6C757D;    /* Low contrast */
--text-muted: #495057;       /* Very low contrast */

/* Background Colors */
--bg-app: #0A0F1A;           /* Main background */
--bg-soft: #0e1020;          /* Subtle variance */
--bg-surface: #121826;       /* Card background */
--bg-elevated: #1c1d1d;      /* Modal, dropdown */
```

### Border Colors
```css
--border-subtle: rgba(255, 255, 255, 0.08);
--border-default: rgba(255, 255, 255, 0.12);
--border-accent: rgba(63, 140, 255, 0.40);
--border-danger: rgba(220, 53, 69, 0.40);
```

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Weights
```css
--weight-regular: 400;   /* Body text */
--weight-medium: 500;    /* Subtle emphasis */
--weight-semibold: 600;  /* Labels, buttons */
--weight-bold: 700;      /* Headings */
```

### Font Sizes
```css
--text-xs: 0.75rem;   /* 12px - Helper text */
--text-sm: 0.85rem;   /* 13.6px - Secondary text */
--text-base: 0.95rem; /* 15.2px - Body text */
--text-md: 1.05rem;   /* 16.8px - Emphasized text */
--text-lg: 1.35rem;   /* 21.6px - Subheadings */
--text-xl: 1.65rem;   /* 26.4px - Headings */
--text-xxl: 2.1rem;   /* 33.6px - Large headings */
```

### Line Heights
```css
--line-tight: 1.1;      /* Headings */
--line-snug: 1.25;      /* Compact text */
--line-normal: 1.45;    /* Body text */
--line-relaxed: 1.65;   /* Spacious text */
```

## Spacing

### Spacing Scale
```css
--space-xxxs: 2px;   /* Minimal spacing */
--space-xxs: 4px;    /* Tiny spacing */
--space-xs: 8px;     /* Extra small */
--space-sm: 12px;    /* Small */
--space-md: 16px;    /* Medium (base) */
--space-lg: 24px;    /* Large */
--space-xl: 32px;    /* Extra large */
--space-xxl: 40px;   /* Extra extra large */
--space-xxxl: 56px;  /* Huge */
```

### Usage Guidelines
- **Component padding**: Use md (16px) as default
- **Form field gaps**: Use lg (24px)
- **Section spacing**: Use xl (32px) or xxl (40px)
- **Page margins**: Use lg (24px) minimum

## Border Radius

### Radius Scale
```css
--radius-xs: 6px;    /* Small elements */
--radius-sm: 8px;    /* Inputs */
--radius-md: 12px;   /* Cards, buttons */
--radius-lg: 18px;   /* Large cards */
--radius-xl: 26px;   /* Extra large */
--radius-pill: 999px; /* Circular */
```

## Shadows & Elevation

### Shadow System
```css
/* Soft shadow - Subtle depth */
--shadow-soft: 0 12px 32px rgba(5, 11, 26, 0.45);

/* Medium shadow - Clear elevation */
--shadow-medium: 0 18px 48px rgba(5, 11, 26, 0.50);

/* Hard shadow - Strong elevation */
--shadow-hard: 0 24px 64px rgba(5, 11, 26, 0.55);
```

### Elevation Levels
```css
/* Level 1 - Raised (buttons, inputs) */
--elevation-raised: 
  0 1px 0 rgba(255, 255, 255, 0.06),
  0 8px 24px rgba(5, 11, 26, 0.32);

/* Level 2 - Overlay (modals, dialogs) */
--elevation-overlay: 0 20px 55px rgba(5, 11, 26, 0.6);

/* Level 3 - Modal (top-level overlays) */
--elevation-modal: 0 32px 80px rgba(5, 11, 26, 0.65);
```

## Animations

### Transitions
```css
--transition-base: all 180ms ease;  /* Default */
--transition-fast: all 120ms ease;  /* Quick actions */
--transition-slow: all 260ms ease;  /* Smooth actions */
```

### Cubic Bezier
```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
```

### Animation Guidelines
- **Button hover**: 180ms ease
- **Tab switching**: 300ms cubic-bezier
- **Modal open**: 260ms ease-out
- **Form validation**: 120ms ease

## Components

### Button Styles

#### Primary Button
```css
background: linear-gradient(135deg, #02173f, #283957);
color: #F8F9FA;
padding: 0 24px;
height: 44px;
border-radius: 12px;
box-shadow: 
  0 12px 32px rgba(5, 11, 26, 0.45),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Hover State:**
```css
transform: translateY(-1px);
box-shadow: 
  0 18px 48px rgba(5, 11, 26, 0.50),
  inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

#### Outline Button
```css
background: transparent;
border: 2px solid rgba(255, 255, 255, 0.12);
color: #F8F9FA;
```

**Hover State:**
```css
background: rgba(255, 255, 255, 0.05);
border-color: #02173f;
box-shadow: 0 0 0 3px rgba(63, 140, 255, 0.22);
```

### Input Styles

#### Text Field
```css
height: 44px;
padding: 0 16px;
background: #121826;
border: 2px solid rgba(255, 255, 255, 0.12);
border-radius: 12px;
color: #F8F9FA;
font-size: 0.95rem;
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Focus State:**
```css
border-color: #02173f;
box-shadow: 0 0 0 4px rgba(63, 140, 255, 0.22);
```

**Error State:**
```css
border-color: #DC3545;
box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.15);
```

### Card Styles

#### Auth Card
```css
max-width: 480px;
backdrop-filter: blur(24px);
background: #121826;
border-radius: 18px;
box-shadow: 
  0 20px 55px rgba(5, 11, 26, 0.6),
  0 0 0 1px rgba(255, 255, 255, 0.05);
padding: 40px;
```

## Iconography

### Icon Style
- **Line weight**: 2px
- **Size**: 18-24px (contextual)
- **Color**: Inherit from parent or text-tertiary
- **Usage**: Minimal, purposeful

### Icon Sources
- Custom SVG icons for brand consistency
- Heroicons for UI elements
- Phosphor Icons for trading-specific icons

## Accessibility

### Color Contrast
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### Focus Indicators
```css
outline: none;
box-shadow: 0 0 0 4px rgba(63, 140, 255, 0.22);
```

### Interactive States
- Default
- Hover
- Focus
- Active
- Disabled

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Stack components vertically */
  /* Increase touch targets to 44px */
  /* Reduce spacing slightly */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Optimize for medium screens */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full experience */
  /* Hover states active */
}
```

## Best Practices

### Do's
✅ Use the spacing scale consistently  
✅ Maintain color contrast ratios  
✅ Keep animations subtle and purposeful  
✅ Test on real devices  
✅ Follow accessibility guidelines  
✅ Use semantic HTML  

### Don'ts
❌ Don't use arbitrary spacing values  
❌ Don't mix font families  
❌ Don't over-animate  
❌ Don't ignore mobile users  
❌ Don't sacrifice accessibility for aesthetics  
❌ Don't use color alone to convey information  

## Resources

### Design Tools
- Figma (for mockups)
- Styled Components (for implementation)
- Chrome DevTools (for debugging)

### Typography
- Google Fonts: https://fonts.google.com/specimen/Inter
- Type Scale Calculator: https://type-scale.com/

### Colors
- Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Palette Generator: https://coolors.co/

### Accessibility
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained by**: BHC Markets Design Team
