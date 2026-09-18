//
// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { NextComponentType, NextPageContext } from 'next';
import { getAccessGroup } from '@/utility/indexed-db';
import { updatePopupVisible } from '@/utility/update-popup';
import { authenticateToken } from '@/utility/auth';
import { sharedRefresh } from '@/utility/jwt';

/**
 * The session check every protected page runs.
 *
 * Three rules, learned from users being asked to sign in when they were still
 * signed in:
 *
 *  - a missing access token is not the end of a session: the refresh token may
 *    still be good, so it is tried first;
 *  - `authenticateToken` already refreshes an expired token and re-checks, so
 *    reaching the catch with a 401 means the session really is over;
 *  - anything else — no network, CORS, a 500, a slow backend — says nothing
 *    about the session, and must not put "your session expired" on screen.
 */
const withAuth = (WrappedComponent: NextComponentType<NextPageContext>) => {
  const AuthComponent: NextComponentType<NextPageContext> = (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const loginData = await getAccessGroup();
          if (!loginData?.ifricdi) {
            const resumed = loginData?.ifricdr ? await sharedRefresh() : false;
            if (!resumed) {
              updatePopupVisible(true);
              return;
            }
          }

          const valid = await authenticateToken();
          if (!valid) {
            updatePopupVisible(true);
          }
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            updatePopupVisible(true);
          } else {
            console.error('Session check could not be completed:', err);
          }
        }
      };

      checkAuth();
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  if (WrappedComponent.getInitialProps) {
    AuthComponent.getInitialProps = WrappedComponent.getInitialProps;
  }

  return AuthComponent;
};

export default withAuth;
