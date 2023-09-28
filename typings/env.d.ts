/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly LIB_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}