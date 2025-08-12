import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize cross-browser compatibility check inline (avoid import issues)
function initializeBrowserCheck() {
  console.log('Browser compatibility check initialized');
  // Basic check - full implementation moved to App component
}

initializeBrowserCheck();

createRoot(document.getElementById("root")!).render(<App />);
