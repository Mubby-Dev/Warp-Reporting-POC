import type { AccountInfo, Configuration, RedirectRequest } from '@azure/msal-browser';
import { EventType, InteractionType, LogLevel, PublicClientApplication } from '@azure/msal-browser';

/**
 * Strict list of environment variables required for MSAL configuration.
 */
type RequiredEnvKey =
  | 'VITE_ENTRA_CLIENT_ID'
  | 'VITE_ENTRA_TENANT_ID'
  | 'VITE_ENTRA_REDIRECT_URI'
  | 'VITE_ENTRA_DEFAULT_SCOPES';

type OptionalEnvKey = 'VITE_ENTRA_AUTHORITY' | 'VITE_ENTRA_POST_LOGOUT_REDIRECT_URI';

const getMandatoryEnvVar = (key: RequiredEnvKey): string => {
  const value = import.meta.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${key} must be defined for MSAL configuration.`);
  }
  return value.trim();
};

const getOptionalEnvVar = (key: OptionalEnvKey): string | undefined => {
  const value = import.meta.env[key];
  return value?.trim() ? value.trim() : undefined;
};

const buildAuthority = (): string => {
  const authority = getOptionalEnvVar('VITE_ENTRA_AUTHORITY');
  if (authority) {
    return authority;
  }

  const tenantId = getMandatoryEnvVar('VITE_ENTRA_TENANT_ID');
  return `https://login.microsoftonline.com/${tenantId}`;
};

const parseScopes = (): string[] => {
  const rawScopes = getMandatoryEnvVar('VITE_ENTRA_DEFAULT_SCOPES');
  const scopes = rawScopes
    .split(/[\s,]+/u)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);

  const essentialScopes = ['openid', 'profile'];
  const mergedScopes = new Set<string>([...essentialScopes, ...scopes]);

  if (mergedScopes.size === 0) {
    throw new Error('At least one Entra ID scope must be configured via VITE_ENTRA_DEFAULT_SCOPES.');
  }

  return Array.from(mergedScopes);
};

const clientId = getMandatoryEnvVar('VITE_ENTRA_CLIENT_ID');
const redirectUri = getMandatoryEnvVar('VITE_ENTRA_REDIRECT_URI');
const postLogoutRedirectUri = getOptionalEnvVar('VITE_ENTRA_POST_LOGOUT_REDIRECT_URI') ?? redirectUri;
const defaultScopes = parseScopes();

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: buildAuthority(),
    redirectUri,
    postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }

        if (level === LogLevel.Error) {
          console.error(message);
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
      piiLoggingEnabled: false,
    },
  },
};

export const msalClient = new PublicClientApplication(msalConfig);

let msalBootstrap: Promise<void> | null = null;

const registerMsalEventCallbacks = () => {
  msalClient.addEventCallback((event) => {
    const account = (event.payload as { account?: AccountInfo })?.account;

    if ((event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) && account) {
      msalClient.setActiveAccount(account);
      return;
    }

    if (event.eventType === EventType.LOGOUT_SUCCESS) {
      msalClient.setActiveAccount(null);
    }
  });
};

const setInitialAccount = () => {
  if (!msalClient.getActiveAccount()) {
    const accounts = msalClient.getAllAccounts();
    if (accounts.length > 0) {
      msalClient.setActiveAccount(accounts[0]);
    }
  }
};

export const initializeMsalClient = async (): Promise<void> => {
  if (!msalBootstrap) {
    msalBootstrap = (async () => {
      await msalClient.initialize();
      registerMsalEventCallbacks();
      setInitialAccount();
    })();
  }

  return msalBootstrap;
};

export const redirectLoginRequest: RedirectRequest = {
  scopes: defaultScopes,
  redirectUri,
  prompt: 'select_account',
};

export const redirectAuthenticationSettings = {
  interactionType: InteractionType.Redirect as const,
  authRequest: redirectLoginRequest,
};