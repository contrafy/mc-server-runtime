import { useEffect, useState } from "react";

export type McStatus = { running: boolean; status: string };

export default function useMcStatus(pollMs = 3000): McStatus {
  const [info, setInfo] = useState<McStatus>({ running: false, status: "unknown" });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const poll = async () => {
      try {
        setInfo(await window.mcApi.status());
      } finally {
        timer = setTimeout(poll, pollMs);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [pollMs]);

  return info;
}