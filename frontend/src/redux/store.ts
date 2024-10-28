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

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import templatesReducer from './templates/templatesSlice';
import assetsSliceReducer from "./asset/assetsSlice";
import contractsSliceReducer from "./contract/contractSlice"
import bindingsSliceReducer from "./binding/bindingsSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        templates: templatesReducer,
        assetsSlice:assetsSliceReducer,
        contracts: contractsSliceReducer,
        bindings: bindingsSliceReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;