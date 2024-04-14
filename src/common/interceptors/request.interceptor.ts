import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { headers, body, query, url, method } = context
      .switchToHttp()
      .getRequest<Request>();
    // simple clean up
    const mQuery = { ...query };
    const mHeaders = { ...headers };
    const mBody = { ...body };
    delete mQuery.token;
    delete mQuery.access_token;
    delete mHeaders.authorization;
    delete mBody.password;
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    console.log('URL -->', `${method} ${url}`);
    console.log('headers -->', mHeaders);
    console.log('body -->', mBody);
    console.log('query -->', mQuery);

    return next.handle();
  }
}
