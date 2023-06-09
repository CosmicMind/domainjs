/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SERVER_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}