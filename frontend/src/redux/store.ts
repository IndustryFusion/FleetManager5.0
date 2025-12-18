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

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import templatesReducer from './templates/templatesSlice';
import assetsSliceReducer from "./asset/assetsSlice";
import contractsSliceReducer from "./contract/contractSlice"
import { persistStore } from 'redux-persist';

export const appReducer = combineReducers({
    auth: authReducer,
    templates: templatesReducer,
    assetsSlice:assetsSliceReducer,
    contracts: contractsSliceReducer,
});

const rootReducer = (state: any, action: any) => {
    if (action.type === "RESET_STORE") {
      state = undefined; // Reset all state
    }
    return appReducer(state, action);
};


export const store = configureStore({
    reducer: rootReducer
});

const persistor = persistStore(store);

export const resetReduxState = async () => {
    await persistor.purge(); // Clears persisted state
    store.dispatch({ type: "RESET_STORE" }); // Resets Redux state
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;