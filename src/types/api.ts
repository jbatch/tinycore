// src/types/api.ts
import { type Request } from "express";
import { KVItem } from "./kv";
import { type ParamsDictionary } from "express-serve-static-core";
import { type ParsedQs } from "qs";
import { Application } from "./application";

// Request bodies
interface SetKVBody {
  value: any;
  metadata?: Record<string, any>;
  owner_id?: string;
}

// Response bodies
interface SuccessResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
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
}
export interface SetKVRequest
  extends Request<ParamsDictionary, any, SetKVBody, any> {
  params: ParamsDictionary & {
    appId: string;
    key: string;
  };
}

export interface DeleteKVRequest
  extends Request<ParamsDictionary, any, any, any> {
  params: ParamsDictionary & {
    appId: string;
    key: string;
  };
}

export interface ListKVRequest
  extends Request<ParamsDictionary, any, any, ParsedQs> {
  params: ParamsDictionary & {
    appId: string;
  };
  query: ParsedQs & {
    prefix?: string;
  };
}

/**
 * Application
 */
export interface GetApplicationRequest extends Request {
  params: {
    id: string;
  };
}

export interface CreateApplicationRequest extends Request {
  body: {
    id: string;
    name: string;
    metadata?: Record<string, any>;
  };
}

export interface UpdateApplicationRequest extends Request {
  params: {
    id: string;
  };
  body: {
    name: string;
    metadata?: Record<string, any>;
  };
}

export interface DeleteApplicationRequest extends Request {
  params: {
    id: string;
  };
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
