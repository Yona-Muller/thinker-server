import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { TOKEN_EXPIRATION_TIME, LONG_TOKEN_EXPIRATION_TIME, TOKEN_REFRESH_TIME } from './constants';
import type { TokenObject, UserForToken } from './dto/token.dto';
import * as jwt from 'jsonwebtoken';

export enum TokenFields {
  SHORT = 'x-token',
  LONG = 'x-long-token',
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createTokenByUser(user: User, tokenField: TokenFields) {
    const payload: any = {
      sub: user.id,
      role: user.role,
    };

    if (user.businesses && user.businesses.length > 0) {
      payload.businessId = user.businesses[0].id;
    } else payload.businessId = null;

    const token = await this.jwtService.signAsync(payload, { expiresIn: tokenField === TokenFields.SHORT ? TOKEN_EXPIRATION_TIME + '' : LONG_TOKEN_EXPIRATION_TIME + '' });

    return token;
  }

  setTokenOnResponse(token: string, response: Response, tokenField: TokenFields) {
    response.cookie(tokenField, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenField === TokenFields.LONG ? LONG_TOKEN_EXPIRATION_TIME : TOKEN_EXPIRATION_TIME,
    });
  }

  removeTokenFromResponse(response: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    const xTokenExists = TokenFields.SHORT in response.req.cookies;
    const xLongTokenExists = TokenFields.LONG in response.req.cookies;

    if (xTokenExists) {
      response.clearCookie(TokenFields.SHORT, cookieOptions);
    }

    if (xLongTokenExists) {
      response.clearCookie(TokenFields.LONG, cookieOptions);
    }
  }

  extractTokenFromCookies(request: Request, cookieName: TokenFields) {
    const token = request.cookies[cookieName] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('There is no token');
    }
    return token;
  }

  async verifyToken(token: string) {
    try {
      const tokenObject = (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })) as TokenObject;
      return tokenObject;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  isTokenExpiringSoon(tokenObject: TokenObject) {
    const expirationTime = tokenObject.exp * 1000;
    const currentTime = Date.now();
    return expirationTime - currentTime <= TOKEN_REFRESH_TIME;
  }

  async refreshToken(userForToken: UserForToken, response: Response) {
    const payload = {
      sub: userForToken.sub,
      role: userForToken.role,
      businessId: userForToken.businessId,
    };
    const token = await this.jwtService.signAsync(payload, { expiresIn: TOKEN_EXPIRATION_TIME + '' });
    this.setTokenOnResponse(token, response, TokenFields.SHORT);
  }

  async getUserIdFromToken(request: Request, cookieName: TokenFields = TokenFields.LONG) {
    const token = this.extractTokenFromCookies(request, cookieName);
    const tokenObject = await this.verifyToken(token);
    return tokenObject.sub;
  }
}
