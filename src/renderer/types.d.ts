export {};

declare global {
  interface Window {
    mcApi: {
      start(): Promise<void>;
      stop(): Promise<void>;
      status(): Promise<{ running: boolean; status: string }>;
    };
  }
}