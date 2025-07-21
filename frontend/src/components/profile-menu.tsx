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

import { clearIndexedDbOnLogout, getAccessGroup } from '@/utility/indexed-db'
import '../../public/styles/profile-menu.css'
import { useEffect, useRef, useState } from 'react';
import { getCompanyDetailsById } from '@/utility/auth';
import { fetchCompanyProduct, getUserDetailsByEmail } from '@/utility/auth';
import Image from 'next/image';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { showToast } from '@/utility/toast';
import { Toast } from 'primereact/toast';
import { resetReduxState } from '../redux/store';
import router from "next/router";

interface Product {
    _id: string;
    product_id: string;
    product_name: string;
    company_id: string;
    __v?: number;
}

interface UserData {
    user_name: string;
    user_email: string;
    company_ifric_id: string;
    company_name: string;
    user_image: string;
    user_role: string;
    products: Product[];
}

export default function ProfileMenu() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const menuTrigger = useRef<any>(null);
    const toast = useRef<Toast>(null);
    const ifxSuiteUrl = process.env.NEXT_PUBLIC_IFX_SUITE_FRONTEND_URL;
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const accessGroupData = await getAccessGroup();
            const companyDetails = await getCompanyDetailsById(accessGroupData.company_ifric_id);
            const userDetails = await getUserDetailsByEmail({
                user_email: accessGroupData.user_email,
                company_ifric_id: accessGroupData.company_ifric_id
            })

            const companyProducts = await fetchCompanyProduct(accessGroupData.company_ifric_id);

            setUserData({
                user_name: accessGroupData.user_name,
                user_email: accessGroupData.user_email,
                company_ifric_id: accessGroupData.company_ifric_id,
                company_name: companyDetails?.data[0].company_name,
                user_image: userDetails?.data[0].user_image,
                user_role: accessGroupData.user_role,
                products: companyProducts?.data
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            showToast(toast, 'error', 'Error', 'Error fetching user data');
        }
    };
    const handleLogout = async () => {
        try {
            const accessGroupData = await getAccessGroup();
            if (accessGroupData?.user_email) {
                await clearIndexedDbOnLogout();
                showToast(toast, 'success', 'Logout Successful', 'You have been logged out');
                setUserData(null);

                // reset redux after successfull logout
                await resetReduxState();
                setTimeout(() => {
                    router.push(`${ifxSuiteUrl}/home`);
                }, 500);
            } else {
                showToast(toast, 'error', 'Logout Failed', 'User email not found');
            }
        } catch (error) {
            console.error("Logout failed:", error);
            showToast(toast, 'error', 'Logout Failed', 'An error occurred during logout');
        }
    };
    let items = [
        {
            template: () => {
                return (
                    <div>
                        <Toast ref={toast} />
                        <div className="profile_bg">
                            <div className="title_company_name">{userData?.company_name}</div>
                        </div>
                        <div className="profile_modal_avatar">
                            {!userData?.user_image ? (
                                <div
                                    className="profile_avatar_circle"
                                >
                                    {userData?.user_name.charAt(0)}
                                </div>
                            ) : (
                                <div
                                    className="profile_avatar_circle"
                                >
                                    <img
                                        alt={userData?.user_name}
                                        src={userData?.user_image}
                                        draggable="false"
                                    />
                                </div>

                            )}
                        </div>
                        <div className="menu_modal_text_wrapper">
                            <div className='menu_modal_name'>{userData?.user_name}</div>
                            <div className='menu_modal_role'>{userData?.user_role.replace(/_/g, ' ')}</div>
                        </div>
                        <div className='menu_modal_email'>{userData?.user_email}</div>
                        <div className="profile_menu_divider"></div>
                        <div className='menu_title'>Products</div>
                        <div className="profile_menu_products">
                            {userData?.products.map(product => (
                                <div className='profile_menu_product_chip' key={product.product_id}>{product.product_name}</div>
                            ))}
                        </div>
                        <div className="profile_menu_divider"></div>
                        <div className="profile_menu_link_wrapper">
                            <Button onClick={handleLogout} className='profile_menu_link logout'>
                                <Image src="/logout_icon.svg" width={22} height={22} alt=''></Image>
                                <div>Logout</div>
                            </Button>
                        </div>
                    </div>
                );
            }
        }
    ];


    return (
        <>
            <Button className='profile_menu_wrapper' onClick={(event) => menuTrigger.current.toggle(event)}>
                {!userData?.user_image ? (
                    <div
                        className="user_avatar_circle"
                    >
                        {userData?.user_name.charAt(0)}
                    </div>
                ): (
                    <img
                    className="user_avatar_image_circle"
                    alt={userData?.user_name}
                    src={userData?.user_image}
                    width={45}
                    height={45}
                    draggable="false"
                />  
                )}
            </Button>
            <Menu model={items} popup ref={menuTrigger} className="profile_menu_modal" />
        </>
    )
}