/**
 * @repo/trading-ui
 * 
 * Professional-grade trading terminal UI components.
 * 
 * Design System:
 * - Dark theme optimized for trading
 * - WCAG compliant contrast ratios
 * - Muted trading colors to reduce eye strain
 * - Micro-animations for real-time updates
 * 
 * Components:
 * - OrderBook - Market depth with bid/ask levels
 * - TradingChart - Candlestick chart with timeframes
 * - OrderForm - Order entry with SL/TP and leverage
 * - PositionsTable - Open position management
 * - Watchlist - Multi-instrument market watch
 * - AccountBar - Account summary header
 * - TerminalPanel - Tabbed positions/orders/history
 * 
 * Supported Instruments:
 * - Forex (FX) - 5-decimal precision
 * - Cryptocurrencies - 24/7 trading
 * - Stocks - Exchange hours support
 * - Commodities - Contract specifications
 * 
 * @example
 * ```tsx
 * import { ThemeProvider } from 'styled-components';
 * import { 
 *   tradingTheme,
 *   OrderBook, 
 *   TradingChart, 
 *   OrderForm, 
 *   useTicker, 
 *   useOrderBook 
 * } from '@repo/trading-ui';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider theme={tradingTheme}>
 *       <YourTradingTerminal />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */

// Theme
export * from './theme';

// Types
export * from './types';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Mock data generators
export * from './mocks';

// Utilities
export * from './utils';
