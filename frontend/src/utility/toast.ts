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
import { RefObject } from "react";
import { Toast } from "primereact/toast";

export const showToast = (
    toast: RefObject<Toast>, severity: "success" | "info" | "warn" | "error", summary: string, message: string): void => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail: message, life: 3000 });
        } else {
            console.warn(
                "Toast component is not available. Message:",
                summary,
                message
            );
        }
};