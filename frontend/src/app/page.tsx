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

'use client'

import { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { getAccessGroupData } from "@/utility/auth";
import axios from "axios";
import { showToast } from "@/utility/toast";
import { Toast } from "primereact/toast";

const ifxSuiteUrl = process.env.NEXT_PUBLIC_IFX_SUITE_FRONTEND_URL;

export default function WelcomePage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const setIndexedDb = async (token: string, from?: string, isIFXSuite?: boolean) => {
    try {
      // fetch access data and store in indexed db and route to asset-overview.
      await getAccessGroupData(token, from, isIFXSuite);
      router.push("/asset-overview");
    } catch (error: any) {
      console.log("error inside page ",error);
      if (axios.isAxiosError(error)) {
        if (error?.response && error?.response?.status === 401) {
          window.location.href = `${ifxSuiteUrl}/home`;   
        } else {
          console.error("Error response:", error.response?.data.message);
          showToast(toast, "error", "Error", "Error during login");
        }
      } else {
        console.error("Error:", error);
        showToast(toast, "error", "Error", error);
      }
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const from = urlParams.get('from') ?? undefined;
    const isIFXSuiteParam = urlParams.get('isIFXSuite');
    const isIFXSuite = isIFXSuiteParam ? isIFXSuiteParam === "true" : undefined;
    if (token) {
     setIndexedDb(token, from, isIFXSuite)
    }
  }, []);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Toast ref={toast} />
    </main>
  );
}
