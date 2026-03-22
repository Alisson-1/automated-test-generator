export type ApiStatus =
  | { state: 'loading' }
  | { state: 'online'; timestamp: string; service: string }
  | { state: 'offline'; error: string };
