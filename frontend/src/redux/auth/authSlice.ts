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
