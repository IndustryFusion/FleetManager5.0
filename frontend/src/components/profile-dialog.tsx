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
import { Dispatch, SetStateAction, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ProfileDialogProps {
    profileDetailProp: boolean;
    setProfileDetailProp: Dispatch<SetStateAction<boolean>>;
  }


const ProfileDialog: React.FC<ProfileDialogProps> =({profileDetailProp, 
    setProfileDetailProp 
})=>{

    const user = useSelector((state: RootState)  => state.auth.user);
    const timerValue = useSelector((state: RootState) => state.auth.timerValue);
    const dispatch = useDispatch();

    useEffect(()=>{
        const timerId = setInterval(() => {
            dispatch(startTimer()); // Dispatch an action to increment the timer value
          }, 1000);
          return () => clearInterval(timerId);
    }, [dispatch])

    const formatTime = (seconds:any) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
     };



    return(
<div className=" flex justify-content-center">        
        <Dialog visible={profileDetailProp} modal 
        header="Profile Details"
            draggable={false} resizable={false}
            style={{ width: '40rem' }} 
            onHide={() => setProfileDetailProp(false)}>
            <p>User Name : {user.length > 0 && user}</p>
            <p className="mt-0" style={{color:"green", fontSize:"13px"}}>Login Since: {formatTime(timerValue)}</p>
         </Dialog>
        </div> 
    )
}

export default ProfileDialog;