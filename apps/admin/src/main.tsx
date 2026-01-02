import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ThemeManager } from '@repo/ui';

if (import.meta.env.VITE_API_BASE) {
    (window as unknown as { __API_BASE?: string }).__API_BASE = import.meta.env.VITE_API_BASE;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeManager>
            <App />
        </ThemeManager>
    </React.StrictMode>,
);
