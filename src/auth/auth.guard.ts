import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { TokenService, TokenFields } from './token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      const token = this.tokenService.extractTokenFromCookies(request, TokenFields.LONG);
      await this.tokenService.verifyToken(token);
    } catch (error) {
      const token = this.tokenService.extractTokenFromCookies(request, TokenFields.SHORT);
      const tokenObject = await this.tokenService.verifyToken(token);
      // request['tokenObject'] = tokenObject;
      if (this.tokenService.isTokenExpiringSoon(tokenObject)) {
        this.tokenService.refreshToken(tokenObject, response);
      }
    }
    return true;
  }
}
