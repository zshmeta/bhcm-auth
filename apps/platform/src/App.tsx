import { Routes, Route, Navigate } from "react-router-dom";
import { TradingWorkspace } from "./features/workspace/TradingWorkspace";

/**
 * Main App Component
 * 
 * Routes directly to the TradingWorkspace for demo purposes.
 * In production, add authentication and dashboard shell.
 */
export const App = () => (
  <Routes>
    <Route path="/trade" element={<TradingWorkspace />} />
    <Route path="/" element={<Navigate to="/trade" replace />} />
    <Route path="*" element={<Navigate to="/trade" replace />} />
  </Routes>
);

export default App;
