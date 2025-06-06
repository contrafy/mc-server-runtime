import { useEffect, useRef, useState, memo } from "react";

import { Textarea } from "@/components/ui/textarea"

const LogOutput = () => {
  const [lines, setLines] = useState<string[]>([]);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const [autoFollow, setAutoFollow] = useState(true);  // true while user hasn’t scrolled up

  useEffect(() => {
    // Initial subscriptions
    window.mcApi.subscribeLogs();

    const unsubLine = window.mcApi.onLogLine(line =>
      setLines(prev => [...prev, line])
    );
    const unsubClear = window.mcApi.onLogsClear(() => setLines([]));

    return () => { unsubLine(); unsubClear(); };
  }, []);

  // auto‑scroll when new lines arrive *and* user is already at bottom
  useEffect(() => {
    if (!boxRef.current || !autoFollow) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [lines, autoFollow]);

  // detect if the user scrolls away from bottom
  const handleScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    setAutoFollow(atBottom);
  };

  return (
    <Textarea
        ref={boxRef}
        onScroll={handleScroll}
        rows={10}
        readOnly
        className="w-full mt-4 p-2 font-mono bg-neutral-900 text-neutral-200 rounded resize-none max-h-[10lh] overflow-y-auto"
        value={lines.join("\n")}
    />
  );
};

export default memo(LogOutput);
