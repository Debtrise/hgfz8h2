import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/new/main.css";
import "./styles/new/components.css";
import "./styles/new/layout.css";
import "./styles/new/dashboard.css";
import "./styles/new/settings.css";
import "./styles/new/theme.css";
import "./styles/marketplace.css";
import "./App.css";
import App from "./App";

// Add theme class to the body for better theming
document.body.classList.add('theme-light');

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
