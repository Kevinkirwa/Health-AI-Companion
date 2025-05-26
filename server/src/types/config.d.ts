declare module '../config/db.js' {
  export function connectDatabase(): Promise<void>;
  export function getDb(): any;
} 