import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { compactDecrypt } from 'jose';
import { createHash } from 'crypto';

@Injectable()
export class AuthGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      // unMask the token
      const unMaskedToken = this.unMask(token, process.env.MASK_SECRET);

      // Decrypt the token
      const ENCRYPTION_KEY = this.deriveKey(process.env.JWT_SECRET!);
      const { plaintext } = await compactDecrypt(unMaskedToken, ENCRYPTION_KEY);
      const decryptedToken = new TextDecoder().decode(plaintext);

      // Attach the unMask token to the request
      request.headers['authorization'] = `Bearer ${decryptedToken}`;
    } catch(err) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private unMask(masked: string, key: string): string {
    return masked.match(/.{1,2}/g)!.map((hex, i) =>
      String.fromCharCode(parseInt(hex, 16) ^ key.charCodeAt(i % key.length))
    ).join('');
  }

  private deriveKey(secret: string): Uint8Array {
    return createHash('sha256').update(secret).digest(); 
  }
}
