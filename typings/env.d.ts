/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_NAME: string
  readonly VITE_NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}