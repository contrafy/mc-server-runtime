// src/components/SettingsForm.tsx
/**
 * A growing form for Minecraft‑server settings.
 * Everything maps 1‑to‑1 to an ENV‑VAR consumed by itzg/minecraft-server.
 *
 * TODO (next steps)
 *  • Wire to main‑process IPC (`mc:settings:save`)
 *  • Add sub‑form for mods / modpacks
 *  • Validation
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select";

type FormState = {
  SERVER_NAME: string;
  VERSION: string;
  MAX_PLAYERS: number;
  DIFFICULTY: "peaceful" | "easy" | "normal" | "hard";
  MOTD: string;
};

const defaultState: FormState = {
  SERVER_NAME: "My Awesome Server",
  VERSION: "LATEST",
  MAX_PLAYERS: 20,
  DIFFICULTY: "normal",
  MOTD: "Welcome to my server!",
};

export default function SettingsForm() {
  const [form, setForm] = useState<FormState>(defaultState);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TEMP: just log.  Next step -> window.mcApi.saveSettings(form)
    console.log("MC-Settings →", form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Server Settings</h2>

      {/* Server name */}
      <div className="space-y-1">
        <Label htmlFor="serverName">Server Name</Label>
        <Input
          id="serverName"
          value={form.SERVER_NAME}
          onChange={e => handleChange("SERVER_NAME", e.target.value)}
        />
      </div>

      {/* Minecraft version */}
      <div className="space-y-1">
        <Label htmlFor="version">MC Version</Label>
        <Input
          id="version"
          placeholder="e.g. 1.20.6 or 'LATEST'"
          value={form.VERSION}
          onChange={e => handleChange("VERSION", e.target.value)}
        />
      </div>

      {/* Max players */}
      <div className="space-y-1">
        <Label htmlFor="maxPlayers">Max Players</Label>
        <Input
          id="maxPlayers"
          type="number"
          min={1}
          max={100}
          value={form.MAX_PLAYERS}
          onChange={e => handleChange("MAX_PLAYERS", Number(e.target.value))}
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-1">
        <Label>Difficulty</Label>
        <Select
          value={form.DIFFICULTY}
          onValueChange={value =>
            handleChange("DIFFICULTY", value as FormState["DIFFICULTY"])
          }
        >
          <SelectTrigger className="w-full" />
          <SelectContent>
            <SelectItem value="peaceful">Peaceful</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* MOTD */}
      <div className="space-y-1">
        <Label htmlFor="motd">MOTD</Label>
        <Input
          id="motd"
          value={form.MOTD}
          onChange={e => handleChange("MOTD", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full">
          Save (stub)
        </Button>
      </div>
    </form>
  );
}
