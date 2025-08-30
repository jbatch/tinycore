import React, { createContext, useContext, ReactNode } from "react";
import { TinyCoreApiClient, TinyCoreConfig } from "../api/core";

interface TinyCoreContextValue {
  client: TinyCoreApiClient;
  config: Required<TinyCoreConfig>;
}

const TinyCoreContext = createContext<TinyCoreContextValue | null>(null);

export function useTinyCoreContext(): TinyCoreContextValue {
  const context = useContext(TinyCoreContext);
  if (!context) {
    throw new Error(
      "useTinyCoreContext must be used within a TinyCoreProvider"
    );
  }
  return context;
}

interface TinyCoreProviderProps {
  config: TinyCoreConfig;
  children: ReactNode;
}

export function TinyCoreProvider({ config, children }: TinyCoreProviderProps) {
  const client = React.useMemo(
    () => new TinyCoreApiClient(config),
    [config.baseUrl, config.apiVersion]
  );

  const contextValue: TinyCoreContextValue = {
    client,
    config: {
      apiVersion: "v1",
      ...config,
    },
  };

  return (
    <TinyCoreContext.Provider value={contextValue}>
      {children}
    </TinyCoreContext.Provider>
  );
}

// Main hook that provides all TinyCore functionality
export function useTinyCore() {
  const { client, config } = useTinyCoreContext();

  return {
    client,
    config,
    // You could add convenience methods here that use the client
    setAuthToken: (token: string | null) => client.setToken(token),
    getAuthToken: () => client.getToken(),
  };
}
