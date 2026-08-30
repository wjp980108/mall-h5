/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly MODE: 'dev' | 'test' | 'prod';
  readonly VITE_PUBLIC_PATH: string;
  readonly VITE_APP_PREFIX: string;
  readonly VITE_HOME_PATH: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_COMPRESSION: 'none' | 'gzip' | 'brotli';

  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
