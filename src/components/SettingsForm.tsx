// src/components/SettingsForm.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectItem, SelectTrigger, SelectContent
} from "@/components/ui/select";
import { McStatus } from "../hooks/useMcStatus";

interface Props { info: McStatus }

export default function SettingsForm({ info }: Props) {
  const [form, setForm] = useState({
    SERVER_NAME: "My Awesome Server",
    VERSION: "LATEST",
    MAX_PLAYERS: 20,
    DIFFICULTY: "normal",
    MOTD: "Welcome to my server!"
  });

  const disabled = info.running;          // single flag drives everything
  const buttonLabel = info.running ? "Running" : "Run";

  const change = (k: keyof typeof form, v: any) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (info.running) return;             // locked
    console.log("Would pass to mc:start with env:", form);
    // (next step) window.mcApi.start(form)
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 h-full">
      <h2 className="text-lg font-semibold">Server Settings</h2>

      {/* SERVER_NAME */}
      <div className="space-y-1">
        <Label htmlFor="name">Server Name</Label>
        <Input
          id="name" disabled={disabled}
          value={form.SERVER_NAME}
          onChange={e => change("SERVER_NAME", e.target.value)}
        />
      </div>

      {/* VERSION */}
      <div className="space-y-1">
        <Label htmlFor="ver">MC Version</Label>
        <Input
          id="ver" disabled={disabled}
          placeholder="e.g. 1.20.6"
          value={form.VERSION}
          onChange={e => change("VERSION", e.target.value)}
        />
      </div>

      {/* MAX_PLAYERS */}
      <div className="space-y-1">
        <Label htmlFor="max">Max Players</Label>
        <Input
          id="max" type="number" min={1} max={100} disabled={disabled}
          value={form.MAX_PLAYERS}
          onChange={e => change("MAX_PLAYERS", Number(e.target.value))}
        />
      </div>

      {/* DIFFICULTY */}
      <div className="space-y-1">
        <Label>Difficulty</Label>
        <Select
          disabled={disabled}
          value={form.DIFFICULTY}
          onValueChange={v => change("DIFFICULTY", v)}
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
          id="motd" disabled={disabled}
          value={form.MOTD}
          onChange={e => change("MOTD", e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <Button disabled={disabled} type="submit" className="w-full">
          {buttonLabel}
        </Button>
      </div>
    </form>
  );
}
