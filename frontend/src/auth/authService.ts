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

import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const loginUrl = BACKEND_API_URL + '/auth/login';

//on sucessfull login , we store access_token and refresh_token in cookies
const login = async (username: string, password: string): Promise<Boolean> => {

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = {
        'username': username,
        'password': password,
    };
    
   
    try {
        const response: AxiosResponse<Boolean> = await axios.post(loginUrl as string, data, { headers });
        if (response.data) {
          return response.data;
        }
        else {
            return false
        }
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error(error.response.data);
                console.error(error.response.status);
                console.error(error.response.headers);
            } else if (error.request) {
                console.error(error.request);
            } else {
                console.error('Error', error.message);
            }
        } else {
            console.error('Error', error.message);
        }
        throw error;
    }
};

export default {
    login
};
