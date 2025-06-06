export {};

declare global {
  interface Window {
    mcApi: {
      start(): Promise<void>;
      stop(): Promise<void>;
      status(): Promise<{ running: boolean; status: string }>;
      /* log helpers */
      subscribeLogs(): void;
      onLogLine(cb: (line: string) => void): () => void;
      onLogsClear(cb: () => void): () => void;
    };
  }
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
