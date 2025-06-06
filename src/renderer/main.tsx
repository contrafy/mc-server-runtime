// src/renderer/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import StatusPanel from "../components/StatusPanel";
import SettingsForm from "../components/SettingsForm";
import useMcStatus from "@/hooks/useMcStatus";

const App = () => {
    const info = useMcStatus();

    return (
    <div className="flex h-screen">
        {/* Left = status/logs */}
        <section className="w-1/2 border-r border-neutral-800 overflow-y-auto">
        <StatusPanel info={info} />
        </section>

        {/* Right = settings */}
        <section className="w-1/2 overflow-y-auto">
        <SettingsForm info={info} />
        </section>
    </div>
    )
};

createRoot(document.getElementById("root")!).render(<App />);
