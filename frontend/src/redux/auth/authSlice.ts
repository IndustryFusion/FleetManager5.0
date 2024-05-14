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

import {createSlice } from '@reduxjs/toolkit';

const getLocalStorageItem = (key: string, defaultValue: string) => {
    if (typeof window !== 'undefined') {
       return parseInt(localStorage.getItem(key) || defaultValue, 10);
    }
    return parseInt(defaultValue, 10);
   };

const getLocalStorageUsername = (defaultValue: string = "") => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('username') || defaultValue;
    }
    return defaultValue;
   };
 
const initialState = {
    user: getLocalStorageUsername(),
    timerValue: getLocalStorageItem('timerValue', '0'),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
          state.user = action.payload;
          if (typeof window !== 'undefined') {
            localStorage.setItem('username', action.payload);
          }
        },
        logout: (state) => {
          state.user = "";
          state.timerValue = 0;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('username');
          }
        },
        startTimer: (state) => {
            state.timerValue += 1; // Increment timer value by 1
            if (typeof window !== 'undefined') {
              localStorage.setItem('timerValue', state.timerValue.toString());
            }
          },
          resetTimer: (state) => {
            state.timerValue = 0; // Reset timer value to 0
          },
      },
});

export const {login , logout, startTimer, resetTimer} = authSlice.actions;

export default authSlice.reducer;
