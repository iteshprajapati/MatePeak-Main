import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './config/sentry'
import { reportWebVitals } from './utils/performanceMonitor'

// Initialize Sentry error tracking
initSentry();

// Report Web Vitals for performance monitoring
if (typeof window !== 'undefined') {
  reportWebVitals();
}

createRoot(document.getElementById("root")!).render(<App />);
