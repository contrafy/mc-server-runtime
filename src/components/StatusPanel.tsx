// src/components/StatusPanel.tsx
import { Button } from "@/components/ui/button";
import LogOutput from "./LogOutput";
import { McStatus } from "../hooks/useMcStatus";

interface Props { info: McStatus }

export default function StatusPanel({ info }: Props) {
  const handleStart = () => window.mcApi.start();
  const handleStop  = () => window.mcApi.stop();

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <h2 className="text-lg font-semibold">Minecraft Server Status</h2>
      <p>{info.status}</p>

      <div className="flex gap-2">
        <Button onClick={handleStart} disabled={info.running}>Start</Button>
        <Button onClick={handleStop}  disabled={!info.running}>Stop</Button>
      </div>

      <LogOutput />
    </div>
  );
}
