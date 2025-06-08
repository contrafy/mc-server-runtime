/**
 * Canonical shape for data coming from the SettingsForm.
 */
export type MinecraftVersion = '1.20.1' | '1.16.5';
export type Difficulty       = 'peaceful' | 'easy' | 'normal' | 'hard';

export interface ServerOptions {
  SERVER_NAME : string;            // shown in server list
  VERSION     : MinecraftVersion;  // restricted to versions we fully support
  MAX_PLAYERS : number;            // 1‑100 for now
  DIFFICULTY  : Difficulty;
  MOTD        : string;
}