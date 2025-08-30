// Re-export types from @jbatch/tinycore-client for consistency
// This allows existing components to continue working
export type {
  User,
  Application,
  KVItem,
  LoginResponse as AuthResponse,
  RegistrationStatusResponse,
} from "@jbatch/tinycore-client";
