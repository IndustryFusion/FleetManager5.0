import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { compactDecrypt } from 'jose';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Marks a request whose token this guard has already read.
 *
 * The guard is registered globally *and* is still named on individual routes
 * with `@UseGuards(AuthGuard)`, so Nest runs it twice on those routes. The
 * first run replaces the masked token in the Authorization header with the
 * decrypted one, and the second run cannot unmask what is no longer masked —
 * so every route that names the guard answered 401. One check per request is
 * what was intended in the first place.
 */
const AUTH_CHECKED = Symbol.for('ifx.auth.checked');

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly logger = new Logger(AuthGuard.name);
  private static warned = false;

  /**
   * The company this installation belongs to.
   *
   * These applications are single-tenant: they read and write services
   * standing on one company's own network. Authentication is not — the
   * registry issues a valid token to any company in the dataspace — so
   * without this, someone from another company could sign in here and act
   * inside this company's installation.
   *
   * Unset, every company is accepted, which is how this behaved before.
   */
  private readonly instanceCompany = process.env.INSTANCE_COMPANY_IFRIC_ID;

  // Optional: the guard is also used directly with @UseGuards(AuthGuard),
  // where Nest constructs it without arguments.
  constructor(private readonly reflector?: Reflector) {}


  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Registered globally, so it is asked about every context. Anything that
    // is not an HTTP request keeps the behaviour it had before.
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector?.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Checked already on the way in; the header no longer carries a masked
    // token for a second pass to read.
    if (request[AUTH_CHECKED]) return true;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    let callerCompany: string | undefined;
    
    try {
      // unMask the token
      const unMaskedToken = this.unMask(token, process.env.MASK_SECRET);

      // Decrypt the token
      const ENCRYPTION_KEY = this.deriveKey(process.env.JWT_SECRET!);
      const { plaintext } = await compactDecrypt(unMaskedToken, ENCRYPTION_KEY);
      const decryptedToken = new TextDecoder().decode(plaintext);

      // Attach the unMask token to the request
      request.headers['authorization'] = `Bearer ${decryptedToken}`;

      callerCompany = this.companyOf(decryptedToken);
    } catch(err) {
      throw new UnauthorizedException();
    }

    // Outside the catch above: a refusal here is a decision, not a malformed
    // token, and must not be reported as one.
    this.assertOwnCompany(callerCompany);

    request[AUTH_CHECKED] = true;
    return true;
  }

  /** The company a registry token was issued to. */
  private companyOf(decryptedToken: string): string | undefined {
    const claims = jwt.decode(decryptedToken) as
      | { company_ifric_id?: string }
      | null;
    return claims?.company_ifric_id;
  }

  /**
   * Refuses a caller from any company other than this installation's.
   *
   * Service accounts are unaffected: their tokens carry no company claim and
   * those calls do not come through this guard.
   */
  private assertOwnCompany(callerCompany: string | undefined): void {
    if (!this.instanceCompany) {
      if (!AuthGuard.warned) {
        AuthGuard.warned = true;
        AuthGuard.logger.warn(
          'INSTANCE_COMPANY_IFRIC_ID is not set, so any company may sign in ' +
            'to this installation. Set it to the company this deployment ' +
            'belongs to.',
        );
      }
      return;
    }
    if (callerCompany && callerCompany === this.instanceCompany) return;

    throw new ForbiddenException(
      `This installation belongs to ${this.instanceCompany}. ` +
        'Sign in with that company\'s account.',
    );
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
