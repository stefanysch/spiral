import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// fontes instaladas pelo npm (sem cdn)
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@/styles/index.css";

import { App } from "@/app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
