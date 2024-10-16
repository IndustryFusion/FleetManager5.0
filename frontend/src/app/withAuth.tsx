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
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode'; 
import { NextComponentType, NextPageContext } from 'next';
import { getAccessGroup } from '@/utility/indexed-db';
import { updatePopupVisible } from '@/utility/update-popup';

interface DecodedToken {
  exp: number; 
}

const withAuth = (WrappedComponent: NextComponentType<NextPageContext>) => {
  const AuthComponent: NextComponentType<NextPageContext> = (props) => {
    const router = useRouter();

   useEffect(() => {
      const checkAuth = async () => {
        try {
          const loginData = await getAccessGroup();
          if (loginData && loginData.jwt_token) {
            const token = loginData.jwt_token;
            try {
              const decoded: DecodedToken = jwtDecode(token);
              const currentTime = Math.floor(Date.now() / 1000);
              if (decoded.exp < currentTime) {
                // Token has expired
                updatePopupVisible(true);
              }
            } catch (error) {
              console.error('Failed to decode token:', error);
              updatePopupVisible(true);
            }
          } else {
            updatePopupVisible(true);
          }
        } catch (error) {
          console.error('Failed to retrieve login data:', error);
          updatePopupVisible(true);
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
