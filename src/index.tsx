// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        console.log('[Performance]', {
            'DNS': perfData.domainLookupEnd - perfData.domainLookupStart,
            'Connection': perfData.connectEnd - perfData.connectStart,
            'Response': perfData.responseEnd - perfData.responseStart,
            'DOM Complete': perfData.domComplete,
        });
    });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);