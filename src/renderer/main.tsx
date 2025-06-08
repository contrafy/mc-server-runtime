// src/renderer/main.tsx
import { useState } from "react";
import { createRoot } from "react-dom/client";
import StatusPanel from "../components/StatusPanel";
import SettingsForm from "../components/SettingsForm";
import useMcStatus from "@/hooks/useMcStatus";
import { ServerOptions } from "@/types/ServerOptions";

/* Default values shown when the app first loads */
const DEFAULT_OPTS: ServerOptions = {
  SERVER_NAME : "My Awesome Server",
  VERSION     : "1.20.1",
  MAX_PLAYERS : 20,
  DIFFICULTY  : "normal",
  MOTD        : "Welcome to my server!"
};

const App = () => {
    const info        = useMcStatus();                  // poll Docker status
    const [opts, setOpts] = useState<ServerOptions>(DEFAULT_OPTS); // shared

    return (
    <div className="flex h-screen mx-auto">
        {/* Left = status/logs */}
        <section className="w-1/2 border-r border-neutral-800 overflow-y-auto">
        <StatusPanel info={info} opts={opts} />
        </section>

        {/* Right = settings */}
        <section className="w-1/2 overflow-y-auto">
        <SettingsForm info={info} opts={opts} setOpts={setOpts} />
        </section>
    </div>
    )
};

createRoot(document.getElementById("root")!).render(<App />);
