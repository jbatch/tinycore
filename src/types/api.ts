// src/types/api.ts
import { type Request } from "express";
import { KVItem } from "./kv";
import { type ParamsDictionary } from "express-serve-static-core";
import { type ParsedQs } from "qs";
import { Application } from "./application";
import { User } from "./user";

// Request bodies
interface SetKVBody {
  value: any;
  metadata?: Record<string, any>;
  // owner_id is now set automatically from req.user
}

interface RegisterBody {
  email: string;
  password: string;
  metadata?: Record<string, any>;
}

interface LoginBody {
  email: string;
  password: string;
}

// Response bodies
interface SuccessResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

/**
 * KV
 */

interface KVUrlParams {
  appId: string;
  key: string;
}

interface KVListUrlParams {
  appId: string;
}

interface KVListQueryParams {
  prefix?: string;
}

export interface GetKVRequest extends Request<ParamsDictionary, any, any, any> {
  params: ParamsDictionary & {
    appId: string;
    key: string;
  };
  user?: User; // Added by auth middleware
}

export interface SetKVRequest
  extends Request<ParamsDictionary, any, SetKVBody, any> {
  params: ParamsDictionary & {
    appId: string;
    key: string;
  };
  user?: User; // Added by auth middleware
}

export interface DeleteKVRequest
  extends Request<ParamsDictionary, any, any, any> {
  params: ParamsDictionary & {
    appId: string;
    key: string;
  };
  user?: User; // Added by auth middleware
}

export interface ListKVRequest
  extends Request<ParamsDictionary, any, any, ParsedQs> {
  params: ParamsDictionary & {
    appId: string;
  };
  query: ParsedQs & {
    prefix?: string;
  };
  user?: User; // Added by auth middleware
}

/**
 * Application
 */
export interface GetApplicationRequest extends Request {
  params: {
    id: string;
  };
  user?: User; // Added by auth middleware
}

export interface CreateApplicationRequest extends Request {
  body: {
    id: string;
    name: string;
    metadata?: Record<string, any>;
  };
  user?: User; // Added by auth middleware
}

export interface UpdateApplicationRequest extends Request {
  params: {
    id: string;
  };
  body: {
    name: string;
    metadata?: Record<string, any>;
  };
  user?: User; // Added by auth middleware
}

export interface DeleteApplicationRequest extends Request {
  params: {
    id: string;
  };
  user?: User; // Added by auth middleware
}

/**
 * User Authentication
 */
export interface RegisterRequest extends Request {
  body: RegisterBody;
}

export interface LoginRequest extends Request {
  body: LoginBody;
}

export interface AuthenticatedRequest extends Request {
  user: User; // Required for authenticated routes
}

// Response types for each endpoint
export type GetKVResponse = KVItem | ErrorResponse;
export type SetKVResponse = SuccessResponse | ErrorResponse;
export type DeleteKVResponse = SuccessResponse | ErrorResponse;
export type ListKVResponse = KVItem[] | ErrorResponse;
export type GetApplicationResponse = Application | ErrorResponse;
export type CreateApplicationResponse = SuccessResponse | ErrorResponse;
export type UpdateApplicationResponse = SuccessResponse | ErrorResponse;
export type DeleteApplicationResponse = SuccessResponse | ErrorResponse;
export type ListApplicationResponse = Application[] | ErrorResponse;
export type RegisterResponse =
  | (SuccessResponse & { user: User })
  | ErrorResponse;
export type LoginResponse = AuthResponse | ErrorResponse;
export type UserProfileResponse = User | ErrorResponse;
export type RegistrationStatusResponse =
  | { registrationAllowed: boolean; hasUsers: boolean }
  | ErrorResponse;
export type ListUsersResponse = User[] | ErrorResponse;
