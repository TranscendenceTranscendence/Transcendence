import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(_exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse();

    response.redirect('https://f1r3s12:3000');
  }
}
