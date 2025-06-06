// src/StatusPanel.tsx
import { useEffect, useState } from 'react';
import LogOutput from './LogOutput';

type McStatus = { running: boolean; status: string };

export default function StatusPanel() {
  const [info, setInfo] = useState<McStatus>({ running: false, status: 'unknown' });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const poll = async () => {
      const s = await window.mcApi.status();
      setInfo(s);   // {running:true, status:'running'}
      timer = setTimeout(poll, 3000);  // poll every 3 s
    };
    poll();
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => window.mcApi.start();
  const handleStop  = () => window.mcApi.stop();

  return (
    <div className="p-4">
      <h2>Minecraft Server Status</h2>
      <p>{info.status}</p>
      <button onClick={handleStart} disabled={info.running}>Start</button>
      <button onClick={handleStop}  disabled={!info.running}>Stop</button>

      <LogOutput />
    </div>
  );
}