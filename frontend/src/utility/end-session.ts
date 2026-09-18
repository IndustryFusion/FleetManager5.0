//
// Copyright (c) 2026 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import axios from 'axios';
import { getAccessGroup, clearIndexedDbOnLogout } from './indexed-db';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;

/**
 * Signs the user out properly: the Keycloak session as well as this browser.
 *
 * Logging out used to clear this app's storage and nothing else, leaving the
 * Keycloak session alive until it idled out — four weeks, now that sessions
 * are long. The session belongs to the user, so ending it signs that user out
 * of the apps they opened from this login, and affects nobody else.
 *
 * The local sign-out always happens, even if Keycloak cannot be reached:
 * pressing "log out" must never leave the user looking signed in.
 */
export const endSession = async (): Promise<void> => {
  try {
    const stored = await getAccessGroup();
    if (stored?.user_email) {
      await axios.post(
        `${BACKEND_API_URL}/auth/logout`,
        { email: stored.user_email, ifricdr: stored.ifricdr },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 },
      );
    }
  } catch (error) {
    console.error('Could not end the Keycloak session:', error);
  }
  await clearIndexedDbOnLogout().catch(() => undefined);
};
