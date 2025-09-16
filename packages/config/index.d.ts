export interface LoadEnvOptions {
  cwd?: string;
  path?: string;
}

export declare function loadEnv(options?: LoadEnvOptions): NodeJS.ProcessEnv;
