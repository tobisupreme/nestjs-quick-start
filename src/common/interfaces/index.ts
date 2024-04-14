import { Request } from 'express';

export abstract class SeedRunner {
  abstract run(): Promise<any>;
}

export enum AuthStrategyType {
  JWT = 'jwt',
  PUBLIC = 'public',
}

interface ICacheKeysEnums {
  TOKENS: string;
  DOMAINS: string;
  PERMISSIONS: string;
  REQUESTS: string;
}

export const CacheKeysEnums = (appName: string): ICacheKeysEnums => ({
  DOMAINS: `${appName}:Domains`,
  PERMISSIONS: `${appName}:Permissions`,
  REQUESTS: `${appName}:Requests`,
  TOKENS: `${appName}:Tokens`,
});

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  UNKNOWN = 'Unknown',
}

export enum ResponseMessage {
  SUCCESS = 'Request Successful!',
  FAILED = 'Request Failed!',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface JwtPayload {
  userId: number;
  sessionId: string;
  email: string;
  username?: string;
}

export interface JwtSignPayload {
  id: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
  permittedFields?: any;
  selectFields?: any;
}
