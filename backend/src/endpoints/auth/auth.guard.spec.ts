//
// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { CompactEncrypt } from 'jose';
import { AuthGuard } from './auth.guard';

/**
 * This installation belongs to one company, and nobody else may sign in to
 * it — otherwise another company's assets are written into this company's
 * plant, through a login that looks entirely legitimate.
 */

const OURS = 'urn:ifric:ifx-eur-com-nap-ours';
const THEIRS = 'urn:ifric:ifx-eur-com-nap-theirs';

const MASK_SECRET = 'mask-secret';
const JWT_SECRET = 'jwt-secret';

/** A registry token, encrypted and masked exactly as the app receives it. */
async function tokenFor(company?: string): Promise<string> {
  const claims = Buffer.from(
    JSON.stringify(company ? { company_ifric_id: company } : {}),
  ).toString('base64url');
  const registryJwt = `${Buffer.from('{"alg":"RS256"}').toString('base64url')}.${claims}.sig`;

  const key = new Uint8Array(createHash('sha256').update(JWT_SECRET).digest());
  const encrypted = await new CompactEncrypt(new TextEncoder().encode(registryJwt))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(key);

  return encrypted
    .split('')
    .map((ch, i) =>
      (ch.charCodeAt(0) ^ MASK_SECRET.charCodeAt(i % MASK_SECRET.length))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
}

const contextWith = (token?: string) =>
  ({
    // The guard runs globally now, so it checks the context type and asks the
    // reflector whether the route is public before doing anything else.
    getType: () => 'http',
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        headers: token ? { authorization: `Bearer ${token}` } : {},
      }),
    }),
  }) as any;

/** Says "not public", which is the case for every route under test here. */
const reflector = { getAllAndOverride: () => false } as any;

describe('AuthGuard company check', () => {
  beforeEach(() => {
    process.env.MASK_SECRET = MASK_SECRET;
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.INSTANCE_COMPANY_IFRIC_ID = OURS;
    (AuthGuard as any).warned = false;
  });

  afterEach(() => {
    delete process.env.INSTANCE_COMPANY_IFRIC_ID;
  });

  it('lets this company in', async () => {
    await expect(
      new AuthGuard(reflector).canActivate(contextWith(await tokenFor(OURS))),
    ).resolves.toBe(true);
  });

  it('refuses another company, and says whose installation this is', async () => {
    const guard = new AuthGuard(reflector);
    await expect(
      guard.canActivate(contextWith(await tokenFor(THEIRS))),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      guard.canActivate(contextWith(await tokenFor(THEIRS))),
    ).rejects.toThrow(OURS);
  });

  it('refuses a token that carries no company at all', async () => {
    await expect(
      new AuthGuard(reflector).canActivate(contextWith(await tokenFor(undefined))),
    ).rejects.toThrow(ForbiddenException);
  });

  it('accepts every company when no company is configured', async () => {
    // How this behaved before. A deployment that has not been given its
    // company keeps working rather than locking everyone out on upgrade.
    delete process.env.INSTANCE_COMPANY_IFRIC_ID;
    await expect(
      new AuthGuard(reflector).canActivate(contextWith(await tokenFor(THEIRS))),
    ).resolves.toBe(true);
  });

  it('still rejects a missing or unreadable token as unauthorised', async () => {
    // A refusal on company grounds is a different answer from a broken
    // token, and the two must not be confused.
    await expect(new AuthGuard(reflector).canActivate(contextWith())).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      new AuthGuard(reflector).canActivate(contextWith('not-a-real-token')),
    ).rejects.toThrow(UnauthorizedException);
  });
});
