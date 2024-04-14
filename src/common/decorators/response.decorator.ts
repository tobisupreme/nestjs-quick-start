import { SetMetadata } from '@nestjs/common';

export const API_RESPONSE_META = 'api_response_metadata';

export interface ApiResponseMetaOptions {
  message?: string;
  statusCode?: number;
  passthrough?: boolean;
}

export const ApiResponseMeta = (options: ApiResponseMetaOptions) =>
  SetMetadata(API_RESPONSE_META, options);
