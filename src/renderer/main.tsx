// src/renderer/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import StatusPanel from "../StatusPanel";

createRoot(document.getElementById("root")!).render(<StatusPanel />);