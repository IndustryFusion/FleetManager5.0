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

const BACKEND_API_URL = process.env.NEXT_PUBLIC_FLEET_MANAGER_BACKEND_URL;
const loginUrl = BACKEND_API_URL + '/auth/login';

//on sucessfull login , we store access_token and refresh_token in cookies
export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(loginUrl, {
            email,
            password,
            product_name:"DPP Creator"
        });
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data;
        } else {
            throw new Error("An unknown error occurred.");
        }
    }
};

