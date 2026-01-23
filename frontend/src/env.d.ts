/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENTRA_CLIENT_ID: string;
  readonly VITE_ENTRA_TENANT_ID: string;
  readonly VITE_ENTRA_REDIRECT_URI: string;
  readonly VITE_ENTRA_DEFAULT_SCOPES: string;
  readonly VITE_ENTRA_AUTHORITY?: string;
  readonly VITE_ENTRA_POST_LOGOUT_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}