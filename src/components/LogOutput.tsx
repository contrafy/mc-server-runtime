import { useEffect, useState, memo } from "react";

const LogOutput = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    // Initial subscriptions
    window.mcApi.subscribeLogs();

    const unsubLine = window.mcApi.onLogLine(line =>
      setLines(prev => [...prev.slice(-9), line])
    );
    const unsubClear = window.mcApi.onLogsClear(() => setLines([]));

    return () => { unsubLine(); unsubClear(); };
  }, []);

  return (
    <textarea
      readOnly
      className="w-full mt-4 p-2 font-mono bg-neutral-900 text-neutral-200 rounded"
      value={lines.join("\n")}
    />
  );
};

export default memo(LogOutput);
