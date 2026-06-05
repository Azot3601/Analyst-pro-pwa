/// <reference types="vite/client" />

declare module 'sql.js' {
  type SqlJsStatic = {
    Database: new () => {
      run(sql: string): void;
      exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
      close(): void;
    };
  };

  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}
