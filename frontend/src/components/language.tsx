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

import "../app/flag.css";
import React, { useEffect, useState } from "react";
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from "next/router";
interface localeObject {
    name: string;
    code: string;
}
const Language: React.FC = () => {
    const router = useRouter();
    const { locale } = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState<{ name: string; code: string } | null>({ name: 'EN', code: 'US' });
    const countries = [
        { name: 'EN', code: 'US' },
        { name: 'DE', code: 'DE' }
    ];
    useEffect(()=> {
        if(locale){
            countries.forEach(data => {
                if(data.name == locale.toLocaleUpperCase()){
                    setSelectedLanguage(data);
                }
            });
        }
    },[])
    
    const changeLocale = (newLocale: any) => {
        setSelectedLanguage(newLocale);
        const { pathname, asPath, query } = router;
        router.push({ pathname, query }, asPath, { locale: newLocale.code == 'US' ? 'en' : newLocale.code.toLowerCase() });
    }

    const selectedLanguageTemplate = (option: localeObject, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const languageOptionTemplate = (option: localeObject) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div>{option.name}</div>
            </div>
        );
    };

    return (
        <Dropdown value={selectedLanguage} onChange={(e) => changeLocale(e.value)} options={countries} optionLabel="name" 
            filter valueTemplate={selectedLanguageTemplate} itemTemplate={languageOptionTemplate} className="w-full md:w-7rem" />
    )
};

export default Language;
