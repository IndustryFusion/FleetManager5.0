//
// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessGroup, storeTokenPair } from "@/utility/indexed-db";
import { refreshSession } from "./refresh-session";
import { updatePopupVisible } from "./update-popup";
import React,{ useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/router';
import popupEventEmitter from './popupEventEmitter';
import "../../public/styles/asset-overview.css";
import { clearIndexedDbOnLogout } from "@/utility/indexed-db";

const ifxSuiteUrl = process.env.NEXT_PUBLIC_IFX_SUITE_FRONTEND_URL;

const api = axios.create({});
api.interceptors.request.use(
    async (config) => {
        try {
            const accessGroup = await getAccessGroup();
            if (accessGroup && accessGroup.ifricdi) {
              config.headers["Authorization"] = `Bearer ${accessGroup.ifricdi}`;
            }
        } catch (error) {
            console.error("Error fetching JWT token from IndexedDB:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Refresh-on-401.
 *
 * The registry's access token now lives for minutes rather than sixty days, so
 * every call starts failing at once a few minutes into a session. On a 401 we
 * refresh once and replay the original request; only if the refresh itself
 * fails does the user see the session-expired popup.
 */

// One in-flight refresh, shared by every request that 401s while it runs.
// Without this, a page that fires a dozen parallel reads fires a dozen
// refreshes — and because Keycloak rotates refresh tokens, all but one of
// those would spend a token the others still hold.
let refreshPromise: Promise<boolean> | null = null;

const runRefresh = async (): Promise<boolean> => {
  try {
    const accessGroup = await getAccessGroup();
    if (!accessGroup?.ifricdr) {
      // Nothing to refresh with. Either a session stored before refresh
      // support, or one that arrived over SSO, which carries no refresh token.
      return false;
    }
    const result = await refreshSession(accessGroup.ifricdr);
    const { ifricdi, ifricdr } = result?.data ?? {};
    if (!ifricdi || !ifricdr) {
      return false;
    }
    // Store the rotated refresh token too, or the *second* refresh fails.
    await storeTokenPair(ifricdi, ifricdr);
    return true;
  } catch (error) {
    return false;
  }
};

const sharedRefresh = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

/**
 * Proactive refresh.
 *
 * The 401-driven path below only reacts once a request has already failed, so
 * a tab left idle loses the session even though it could have kept it: the
 * access token lives 300s and the refresh token 1800s, and after 30 idle
 * minutes there is nothing left to refresh with. Refreshing on a clock keeps
 * the refresh token rotating, which also resets Keycloak's idle window, so an
 * open tab stays signed in for as long as the realm's absolute session cap
 * allows instead of 30 minutes.
 *
 * 4 minutes against a 300s access token leaves a minute of margin. The
 * lifetime cannot be read from the token here — `ifricdi` is encrypted and
 * masked — so it is a constant, and deliberately shorter than any plausible
 * shortening of the access-token lifespan.
 *
 * Deliberate trade-off: this defeats the idle timeout. An unattended open tab
 * stays authenticated rather than being signed out after 30 minutes.
 */
const PROACTIVE_REFRESH_MS = 4 * 60 * 1000;

// A refresh token that has already failed is not retried. Without this a dead
// session would be re-attempted every four minutes forever; a fresh login
// stores a different token, which resumes normal ticking on its own.
let lastFailedRefreshToken: string | null = null;

const proactiveRefresh = async (): Promise<void> => {
  let accessGroup;
  try {
    accessGroup = await getAccessGroup();
  } catch {
    return;
  }
  // No session yet, signed out, or a session stored before refresh support.
  if (!accessGroup?.ifricdr) {
    return;
  }
  if (accessGroup.ifricdr === lastFailedRefreshToken) {
    return;
  }
  // Shared with the 401 path, so a tick landing next to a failed request
  // produces one refresh between them, not two.
  const refreshed = await sharedRefresh();
  if (!refreshed) {
    lastFailedRefreshToken = accessGroup.ifricdr;
    // No popup here. The user is not necessarily looking at the tab, and the
    // next real request will surface it through the interceptor anyway.
  }
};

if (typeof window !== 'undefined') {
  setInterval(proactiveRefresh, PROACTIVE_REFRESH_MS);

  // Browsers throttle — and eventually freeze — timers in hidden tabs, so the
  // interval alone cannot be relied on to have kept running while the tab was
  // in the background. Refreshing on the way back covers that gap.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void proactiveRefresh();
    }
  });
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !config) {
      return Promise.reject(error);
    }

    // `_retry` bounds this to a single attempt. A replay that 401s again means
    // the refresh succeeded but the new token was still rejected, so the
    // session really is finished — say so rather than looping.
    if (config._retry) {
      updatePopupVisible(true);
      return Promise.reject(error);
    }
    config._retry = true;

    const refreshed = await sharedRefresh();
    if (!refreshed) {
      updatePopupVisible(true);
      return Promise.reject(error);
    }

    // No header rewriting needed — the request interceptor re-reads ifricdi
    // from IndexedDB, so the replay picks up the refreshed token.
    return api(config);
  }
);

export default api;

export const UnauthorizedPopup: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Listen for the "showPopup" event
    popupEventEmitter.on('showPopup', setVisible);

    // Cleanup listeners on unmount
    return () => {
      popupEventEmitter.removeAllListeners();
    };
  }, []);

  
  const handleLogin = async () => {
    await clearIndexedDbOnLogout();
    window.location.href = `${ifxSuiteUrl}/home`;
    setVisible(false);
  }

  const footerContent = (
    <div>
      <Button label="cancel" className="cancel-btn" onClick={() => setVisible(false)} />
      <Button label="log in" className="action-btn-save" onClick={() => handleLogin()} autoFocus />
    </div>
  );

  if (!visible) {
    return null;
  } else if (["/auth/login", "/auth/register", "/recover-password", "/auth/reset/update-password", "/privacy", "/terms-and-conditions", "/thankyou", "/forgot-password"].includes(router.pathname)) {
    return null;
  }

  return (
    <>
      <div className="popup">
        <Dialog 
          header="Session Expired" 
          visible={visible} 
          className="clone-dialog"
          style={{ width: "30vw" }}
          onHide={() => setVisible(false)} 
          footer={footerContent}>
            <div className="flex  align-items-center gap-4 mb-14">
              <label className="clone-label">
                Your Session has expired, Please login again.
              </label>
            </div> 
        </Dialog>
      </div>
    </>
  );
}