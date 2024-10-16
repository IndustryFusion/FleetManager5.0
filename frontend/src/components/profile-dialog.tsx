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

import { startTimer } from "@/redux/auth/authSlice";
import { RootState } from "@/redux/store";
import { Dialog } from "primereact/dialog";
import { Dispatch, SetStateAction, useEffect, useRef,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { clearIndexedDbOnLogout ,getAccessGroup} from "@/utility/indexed-db";
import { showToast } from "@/utility/toast";
import router from "next/router";
import { Toast } from "primereact/toast";

interface ProfileDialogProps {
    profileDetailProp: boolean;
    setProfileDetailProp: Dispatch<SetStateAction<boolean>>;
}

const ifxSuiteUrl = process.env.NEXT_PUBLIC_IFX_SUITE_FRONTEND_URL;

const ProfileDialog: React.FC<ProfileDialogProps> = ({ profileDetailProp,
    setProfileDetailProp
}) => {

    const timerValue = useSelector((state: RootState) => state.auth.timerValue);
    const dispatch = useDispatch();
    const toast = useRef<Toast>(null);
    const [userData, setUserData] = useState<{ user_name: string; user_email: string } | null>(null);

    useEffect(() => {
      
        const timerId = setInterval(() => {
            dispatch(startTimer()); 
        }, 1000);
        return () => clearInterval(timerId);
    }, [dispatch])

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getAccessGroup();
                if (data) {
                    setUserData({
                        user_name: data.user_name,
                        user_email: data.user_email
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                showToast(toast, 'error', 'Error', 'Failed to fetch user data');
            }
        };

        fetchUserData();
    }, []);

    const formatTime = (seconds: any) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleLogout = async () => {
        try {
            if (userData?.user_email) {
                await clearIndexedDbOnLogout();
                showToast(toast, 'success', 'Logout Successful', 'You have been logged out');
                setTimeout(() => {
                    window.location.href = `${ifxSuiteUrl}/home`; 
                },500);
            } else {
                showToast(toast, 'error', 'Logout Failed', 'User email not found');
            }
        } catch (error) {
            console.error("Logout failed:", error);
            showToast(toast, 'error', 'Logout Failed', 'An error occurred during logout');
        }
    };
    return (
        <div className=" flex justify-content-center">
            <Dialog visible={profileDetailProp} modal
                header="Profile Details"
                draggable={false} resizable={false}
                style={{ width: '40rem' }}
                onHide={() => setProfileDetailProp(false)}>
                {userData ? (
                    <>
                        <p>User Name: {userData.user_name}</p>
                        <p>User Email: {userData.user_email}</p>
                    </>
                ) : (
                    <p>Loading user data...</p>
                )}
              
                <Button label="Logout" 
                    className="bg-black-alpha-90 text-white hover:bg-black-alpha-80 border-none"
                    onClick={handleLogout}
                />
            </Dialog>
        </div>
    )
}

export default ProfileDialog;