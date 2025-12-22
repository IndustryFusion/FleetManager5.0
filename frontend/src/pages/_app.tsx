
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

import {AppProps} from "next/app"
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primeicons/primeicons.css";
import '../static/jank-empty.css';
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { appWithTranslation } from "next-i18next";
import { UnauthorizedPopup } from '../utility/jwt';
import withAuth from "@/app/withAuth";
import Head from "next/head";
import { getAccessGroupData } from "@/utility/auth";
import axios from "axios";
import { useEffect, useState } from "react";
import { updatePopupVisible } from "@/utility/update-popup";

// Import your custom components or layout components
function MyApp({ Component, pageProps, router }:AppProps) {
  const ifxSuiteUrl = process.env.NEXT_PUBLIC_IFX_SUITE_FRONTEND_URL;
   const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleTokenRouting = async (token) => {
      const url = new URL(window.location.href);

      const from = url.searchParams.get("from") ?? undefined;
      try {
        await getAccessGroupData(token, from);
        // remove only token and route to url
        url.searchParams.delete("token");
        url.searchParams.delete("from");
        setIsReady(true);
        router.replace(url.pathname + url.search);
      } catch (error: any) {
        setIsReady(true);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
           if(isReady){
              updatePopupVisible(true);
           }
          } else {
            console.error("Error response:", error.response?.data?.message);
          }
        }
      }
    };

    if (router.isReady) {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token")?? undefined ;

      if (token === undefined) {
        setIsReady(true);
        return;
      } else {
        handleTokenRouting(token);
      }
    }
  }, [router.isReady, router.asPath]);

  const AuthComponent =
    ["/auth/login", "/auth/register", "/recover-password", "/auth/reset/update-password", "/privacy", "/terms-and-conditions"].includes(router.pathname)
        ? Component
        : withAuth(Component);
  return (
    <Provider store={store}>
      <Head>
        <link rel="icon" type="image/x-icon" href="favicon.ico"></link>
      </Head>
        {isReady && (
    <div>
      <AuthComponent {...pageProps} />
      <UnauthorizedPopup />
    </div>
        )}
    </Provider>
  );
}

export default appWithTranslation(MyApp);
