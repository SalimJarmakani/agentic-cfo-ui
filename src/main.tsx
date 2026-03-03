import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.tsx";
import About from "./components/about.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import SpendingSummary from "./pages/SpendingSummary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/spendingsummary" element={<SpendingSummary />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
