// Core API
export { TinyCoreApiClient, type TinyCoreConfig } from "./api/core";

export { KVApi } from "./api/kv";
export {
  AuthApi,
  type LoginResponse,
  type RegistrationStatusResponse,
} from "./api/auth";
export { ApplicationsApi, type Application } from "./api/applications";
export { type User, type KVItem } from "./common/types";

// React Hooks
export {
  TinyCoreProvider,
  useTinyCore,
  useTinyCoreContext,
} from "./hooks/useTinyCore";
export { useAuth, useRegistrationStatus } from "./hooks/useAuth";
export { useKVStore, useKVList } from "./hooks/useKVStore";
export { useApplications, useApplication } from "./hooks/useApplications";

// Re-export everything for convenience
export * from "./api/core";
export * from "./api/kv";
export * from "./api/auth";
export * from "./api/applications";
export * from "./hooks/useTinyCore";
export * from "./hooks/useAuth";
export * from "./hooks/useKVStore";
export * from "./hooks/useApplications";
