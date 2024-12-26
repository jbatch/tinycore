// src/types/api.ts
import { type Request } from "express";
import { KVItem } from "./kv";
import { type ParamsDictionary } from "express-serve-static-core";
import { type ParsedQs } from "qs";

// Generic params with app_id and key
interface KVUrlParams {
  appId: string;
  key: string;
}

// For listing keys (only has appId)
interface KVListUrlParams {
  appId: string;
}

interface KVListQueryParams {
  prefix?: string;
}

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

// Request types for each endpoint
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

// Response types for each endpoint
export type GetKVResponse = KVItem | ErrorResponse;

export type SetKVResponse = SuccessResponse | ErrorResponse;

export type DeleteKVResponse = SuccessResponse | ErrorResponse;

export type ListKVResponse = KVItem[] | ErrorResponse;
