import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import "leaflet/dist/leaflet.css";
import { LanguageProvider } from "./contexts/LanguageContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);
