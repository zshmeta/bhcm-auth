import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { router } from "./router";
import "./App.css";

export default function App() {
  return (
    <div className="app-root">
      {/* AuthProvider owns session state; routing stays separate. */}
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  );
}
