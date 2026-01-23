import { createContext, useCallback, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import type { AccountInfo, EndSessionRequest } from '@azure/msal-browser';
import { msalClient, msalConfig, redirectLoginRequest } from '../auth/msalConfig.ts';

export type AuthenticatedUser = {
  homeAccountId: string;
  localAccountId: string;
  username: string;
  name?: string;
  tenantId?: string;
  objectId?: string;
  claims?: Record<string, unknown>;
};

export type AuthContextValue = {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const sanitizeClaims = (claims?: AccountInfo['idTokenClaims']): Record<string, unknown> | undefined => {
  if (!claims) {
    return undefined;
  }

  return Object.entries(claims).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (typeof value !== 'undefined') {
      acc[key] = value as unknown;
    }
    return acc;
  }, {});
};

const mapAccountToUser = (account: AccountInfo | null): AuthenticatedUser | null => {
  if (!account) {
    return null;
  }

  const claims = account.idTokenClaims ?? {};
  const tenantId = typeof claims.tid === 'string' ? claims.tid : undefined;
  const objectId = typeof claims.oid === 'string' ? claims.oid : undefined;

  return {
    homeAccountId: account.homeAccountId,
    localAccountId: account.localAccountId,
    username: account.username,
    name: account.name ?? (typeof claims.name === 'string' ? claims.name : undefined),
    tenantId,
    objectId,
    claims: sanitizeClaims(account.idTokenClaims),
  };
};

const AuthContextController = ({ children }: PropsWithChildren) => {
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (!instance.getActiveAccount() && accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  const activeAccount = useMemo<AccountInfo | null>(() => {
    const currentActive = instance.getActiveAccount();
    if (currentActive) {
      return currentActive;
    }

    return accounts.length > 0 ? accounts[0] : null;
  }, [accounts, instance]);

  const user = useMemo(() => mapAccountToUser(activeAccount), [activeAccount]);
  const isAuthenticated = useMemo(() => activeAccount !== null, [activeAccount]);

  const signIn = useCallback(async () => {
    try {
      await instance.loginRedirect({ ...redirectLoginRequest });
    } catch (error) {
      console.error('MSAL redirect sign-in failed.', error);
      throw error;
    }
  }, [instance]);

  const signOut = useCallback(async () => {
    const logoutRequest: EndSessionRequest = {
      account: instance.getActiveAccount() ?? activeAccount ?? undefined,
      postLogoutRedirectUri: msalConfig.auth?.postLogoutRedirectUri ?? redirectLoginRequest.redirectUri,
    };

    try {
      await instance.logoutRedirect(logoutRequest);
    } catch (error) {
      console.error('MSAL redirect sign-out failed.', error);
      throw error;
    }
  }, [activeAccount, instance]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      signIn,
      signOut,
      isAuthenticated,
      user,
    }),
    [isAuthenticated, signIn, signOut, user],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }: PropsWithChildren) => (
  <MsalProvider instance={msalClient}>
    <AuthContextController>{children}</AuthContextController>
  </MsalProvider>
);

// The custom hook is exported from this module to keep the auth surface centralized.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};
