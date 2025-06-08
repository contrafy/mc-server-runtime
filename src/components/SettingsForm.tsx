// src/components/SettingsForm.tsx
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectItem, SelectTrigger, SelectContent
} from "@/components/ui/select";
import { McStatus } from "@/hooks/useMcStatus";
import type { ServerOptions, MinecraftVersion, Difficulty } from "@/types/ServerOptions";

interface Props {
  info: McStatus;
  opts: ServerOptions;                                          // controlled value
  setOpts: React.Dispatch<React.SetStateAction<ServerOptions>>; // setter
}

export default function SettingsForm({ info, opts, setOpts }: Props) {
  const disabled    = info.running;        // lock while server is live
  const change = <K extends keyof ServerOptions>(k: K, v: ServerOptions[K]) =>
    setOpts(prev => ({ ...prev, [k]: v }));

  /* The form no longer "starts" the server; it just edits options.
     We still prevent default so hitting Enter won't reload the page. */
  const handleSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 h-full">
      <h2 className="text-lg font-semibold">Server Settings</h2>

      {/* SERVER_NAME */}
      <div className="space-y-1">
        <Label htmlFor="name">Server Name</Label>
        <Input
          id="name" disabled={disabled}
          value={opts.SERVER_NAME}
          onChange={e => change("SERVER_NAME", e.target.value)}
        />
      </div>

      {/* VERSION */}
      <div className="space-y-1">
        <Label>MC Version</Label>
        <Select
          disabled={disabled}
          value={opts.VERSION}
          onValueChange={v => change('VERSION', v as MinecraftVersion)}
        >
          <SelectTrigger className="w-full" />
          <SelectContent>
            <SelectItem value="1.20.1">1.20.1</SelectItem>
            <SelectItem value="1.16.5">1.16.5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* MAX_PLAYERS */}
      <div className="space-y-1">
        <Label htmlFor="max">Max Players</Label>
        <Input
          id="max" type="number" min={1} max={100} disabled={disabled}
          value={opts.MAX_PLAYERS}
          onChange={e => change("MAX_PLAYERS", Number(e.target.value))}
        />
      </div>

      {/* DIFFICULTY */}
      <div className="space-y-1">
        <Label>Difficulty</Label>
        <Select
          disabled={disabled}
          value={opts.DIFFICULTY}
          onValueChange={v => change("DIFFICULTY", v as Difficulty)}
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
          value={opts.MOTD}
          onChange={e => change("MOTD", e.target.value)}
        />
      </div>

      <div className="mt-auto"/>
    </form>
  );
}
