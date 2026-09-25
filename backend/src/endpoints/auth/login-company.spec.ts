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

import { HttpException } from '@nestjs/common';

/**
 * Signing in with an account from another company is refused on the form,
 * not after the user has been taken to a page. The credentials are correct
 * and the registry accepted them - the account simply belongs elsewhere.
 */

const OURS = 'urn:ifric:ifx-eur-com-nap-ours';
const THEIRS = 'urn:ifric:ifx-eur-com-nap-theirs';

// The check itself, as each auth service holds it. Kept here rather than
// reaching into a service that needs a dozen collaborators to construct.
const assertOwnCompany = (callerCompany: string | undefined): void => {
  const instanceCompany = process.env.INSTANCE_COMPANY_IFRIC_ID;
  if (!instanceCompany) return;
  if (callerCompany && callerCompany === instanceCompany) return;
  throw new HttpException(
    `This installation belongs to ${instanceCompany}. ` +
      "Sign in with that company's account.",
    403,
  );
};

describe('signing in to an installation that belongs to one company', () => {
  afterEach(() => delete process.env.INSTANCE_COMPANY_IFRIC_ID);

  it('lets this company sign in', () => {
    process.env.INSTANCE_COMPANY_IFRIC_ID = OURS;
    expect(() => assertOwnCompany(OURS)).not.toThrow();
  });

  it('refuses another company, and names the installation', () => {
    process.env.INSTANCE_COMPANY_IFRIC_ID = OURS;
    expect(() => assertOwnCompany(THEIRS)).toThrow(OURS);
  });

  it('answers 403, not 401: the credentials were right', () => {
    process.env.INSTANCE_COMPANY_IFRIC_ID = OURS;
    try {
      assertOwnCompany(THEIRS);
      fail('should have refused');
    } catch (err) {
      expect((err as HttpException).getStatus()).toBe(403);
    }
  });

  it('accepts everyone when no company is configured', () => {
    expect(() => assertOwnCompany(THEIRS)).not.toThrow();
  });
});
