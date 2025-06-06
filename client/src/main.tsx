import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler to suppress runtime error overlays
window.addEventListener('error', (event) => {
  // Suppress error overlay for API errors (4xx, 5xx responses)
  if (event.error?.message?.match(/^\d{3}:/)) {
    event.preventDefault();
    event.stopPropagation();
    console.log('API error caught and suppressed:', event.error.message);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Suppress promise rejection overlays for API errors
  if (event.reason?.message?.match(/^\d{3}:/)) {
    event.preventDefault();
    console.log('API promise rejection caught and suppressed:', event.reason.message);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
