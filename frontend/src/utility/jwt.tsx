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

import axios from "axios";
import { getAccessGroup } from "@/utility/indexed-db";
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

export default api;

export const UnauthorizedPopup: React.FC = (popupVisible) => {
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

  useEffect(() => {
    if (popupVisible) {
      setVisible(true);
    } else{
       setVisible(false);
    }
  }, [popupVisible]);
  
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