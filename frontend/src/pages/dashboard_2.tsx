import '../../public/styles/dashboard_2.css'
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { PiSteeringWheelFill } from "react-icons/pi";
import { FaHelmetSafety } from "react-icons/fa6";
import { BiSolidUpArrow } from 'react-icons/bi';
import Image from 'next/image';
import { useState } from 'react';
import { IoCubeSharp } from 'react-icons/io5';
import { Button } from 'primereact/button';
import CustomAccordion from '@/components/dashboard/custom-accordion';

interface Card {
    id: string;
    status: string;
    plan: number;
    mined: number;
    engaged: number;
    workers: number;
    entrance: string;
}

export default function DashboardTwo() {
    const cards = [
        { id: 'ACO1XX92', status: 'In Progress', plan: 75000, mined: 49976, engaged: 318, workers: 296, entrance: 'C' },
        { id: 'BTO2YY47', status: 'Completed', plan: 120000, mined: 120000, engaged: 520, workers: 480, entrance: 'A' },
        { id: 'DPO3ZZ58', status: 'Pending', plan: 90000, mined: 0, engaged: 0, workers: 0, entrance: 'B' },
        { id: 'ETO4WW83', status: 'In Progress', plan: 60000, mined: 35800, engaged: 200, workers: 185, entrance: 'D' }
    ];
    const wagons = [
        { id: 'WG09-31', uptime: '05:13:31', delivered: '27.5', progress: '61', value: 620 },
        { id: 'WG09-32', uptime: '04:31:31', delivered: '21.5', progress: '53', value: 548 },
        { id: 'WG09-33', uptime: '06:45:12', delivered: '32.8', progress: '75', value: 710 },
        { id: 'WG09-34', uptime: '03:20:45', delivered: '18.2', progress: '48', value: 490 }
    ];

    const [currentTab, setCurrentTab] = useState<number | null>(1);
    const [selectedCard, setSelectedCard] = useState<Card | null>(cards[0])

    const handleCardSelection = (card: Card) => {
        setSelectedCard(null);
        setTimeout(() => {
            setSelectedCard(card);
        }, 0);
    }


    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleTabSelection = (tab: number) => {
        if (currentTab === tab) {
            return;
        }
        setCurrentTab(null);
        setTimeout(() => {
            setCurrentTab(tab);
        }, 0);
    }
    const workerHeader = () => {
        return (
            <div className='accordion_header_custom'>
                <div>Workers</div>
                <div><FaHelmetSafety className='card_icons' /><span>{selectedCard?.workers}</span></div>
            </div>
        )
    }
    const workerBody = () => {
        return (<><div className='accordion_body_content_cover'>
            accordion body</div></>)
    }
    const machineHeader = () => {
        return (
            <div className='accordion_header_custom'>
                <div>Wagons</div>
                <div><PiSteeringWheelFill className='card_icons' /><span>{selectedCard?.engaged}</span></div>
            </div>
        )
    }
    const machineBody = () => {
        return (
            <div>
                {wagons.map((wagon) => (
                    <div className='accordion_body_content_cover' key={wagon.id}>
                        <div className='machine_content_header'>
                            <div>
                                <div>{wagon.id}</div>
                                <div>Transport ID</div>
                            </div>
                            <div>
                                <div>{wagon.uptime}</div>
                                <div>Uptime</div>
                            </div>
                            <div>
                                <div>{wagon.delivered} <sup>mt</sup></div>
                                <div>Delivered</div>
                            </div>
                            <Button className='wagon_context_button'><Image src="/dashboard/context_icon.svg" width={20} height={20} alt='filter_icon' /></Button>
                        </div>
                        <div className="card_progress_wrapper dark">
                            <div>
                                <div>Progress {wagon.progress}%</div>
                            </div>
                            <div className="progress_track">
                                <div>0 <sup>kg</sup></div>
                                <div>750 <sup>kg</sup></div>
                                <div className="progress_done" style={{ width: `${wagon.progress}%` }}>
                                    <div className="completed_arrow">
                                        <BiSolidUpArrow />
                                        <div>{wagon.value}</div>
                                    </div>
                                </div>
                                <div className="progress_pending"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>)
    }
    return (
        <div className="flex">
            <Sidebar />
            <div className="main_content_wrapper">
                <div className="navbar_wrapper">
                    <Navbar navHeader="Dashboard" />
                </div>
                <div className="dashboard_2_content">
                    <div className="grid_three_columns">
                        <div className="dashboard_grid_card_wrapper">
                            {cards.map((card) => (
                                <div key={card.id} className={`dashboard_2_card ${selectedCard?.id === card.id ? "selected" : ""}`} onClick={() => handleCardSelection(card)}>
                                    <div className="dashboard_card_status">
                                        <div className={`status_tag ${card.status.toLowerCase().replace(' ', '_')}`}>
                                            {card.status}
                                        </div>
                                        <div className="status_tag">
                                            {card.id}
                                        </div>
                                    </div>
                                    <div className="card_data">
                                        <div>
                                            <div className="card_th">
                                                Mined<sup>mt</sup>
                                            </div>
                                            <div className="card_td">
                                                {card.mined.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="card_th">
                                                Plan<sup>mt</sup>
                                            </div>
                                            <div className="card_td">
                                                {card.plan.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card_data">
                                        <div>
                                            <div className="card_th">
                                                Engaged
                                            </div>
                                            <div className="card_td">
                                                {card.engaged.toLocaleString()}
                                                <span><PiSteeringWheelFill className='card_icons' /></span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="card_th">
                                                Workers
                                            </div>
                                            <div className="card_td">
                                                {card.workers.toLocaleString()}
                                                <span><FaHelmetSafety className='card_icons' /></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card_progress_wrapper">
                                        <div>
                                            {card.mined == 0 ? (
                                                <div>Progress 0%</div>
                                            ) : (<div>Progress {Math.round((card.mined / card.plan) * 100)}%</div>)}
                                        </div>
                                        <div className="progress_track">
                                            <div>{card.mined.toLocaleString()} mt</div>
                                            <div>{card.plan.toLocaleString()} mt</div>
                                            <div className="progress_done" style={{ width: `${Math.round((card.mined / card.plan) * 100)}%` }}>
                                                {card.status === 'In Progress' && (
                                                    <div className="completed_arrow"><BiSolidUpArrow />
                                                        <div>{card.mined.toLocaleString()}</div></div>
                                                )}
                                            </div>
                                            <div className="progress_pending"></div>
                                        </div>
                                    </div>
                                    <div className="card_footer">
                                        <div>
                                            <button className="card_footer_button" onClick={handleButtonClick}><Image src="/dashboard/map_icon.svg" width={20} height={20} alt="filter" /><div>Entrance {card.entrance}</div></button>
                                        </div>
                                        <div>
                                            <button className="card_footer_button" onClick={handleButtonClick}><Image src="/dashboard/note_icon.svg" width={20} height={20} alt="filter" /></button>
                                            <button className="card_footer_button" onClick={handleButtonClick}><Image src="/dashboard/notification_icon.svg" width={20} height={20} alt="filter" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="dashboard_main_wrapper">
                            {selectedCard !== null && (
                                <div className="grid_main_content">
                                    <div className="grid_main_content_header">
                                        <div className="content_chip">
                                            Section 9
                                        </div>
                                        <div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                            <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                            <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                        </div>
                                    </div>
                                    <div className="grid_main_content_card">
                                        <div>
                                            <div>AA</div>
                                        </div>
                                        <div>
                                            <div>AB</div>
                                        </div>
                                        <div>
                                            <div>BA</div>
                                            <div className='main_content_chip_wrapper'>
                                                <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                                <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                            </div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                        </div>
                                        <div>
                                            <div>N/A</div>
                                        </div>
                                        <div>
                                            <div>BA</div>
                                            <div className='main_content_chip_wrapper'>
                                                <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                                <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                            </div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                        </div>
                                        <div>
                                            <div>AD</div>
                                            <div className='main_content_chip_wrapper'>
                                                <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                                <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                            </div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                        </div>
                                        <div>
                                            <div>BB</div>
                                            <div className='main_content_chip_wrapper'>
                                                <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                                <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                            </div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                        </div>
                                        <div>
                                            <div></div>
                                        </div>
                                        <div>
                                            <div>CA</div>
                                        </div>
                                        <div>
                                            <div>CB</div>
                                            <div className='main_content_chip_wrapper'>
                                                <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                                <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                            </div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                        </div>
                                        <div>
                                            <div>DA</div>
                                            <div className='main_content_chip_wrapper'>
                                                <div className="content_chip"><span><PiSteeringWheelFill className='card_icons' /></span>{selectedCard.engaged}</div>
                                                <div className="content_chip"><span><FaHelmetSafety className='card_icons' /></span>{selectedCard.workers}</div>
                                            </div>
                                            <div className="content_chip"><span><IoCubeSharp /></span>{selectedCard.mined}<sub>mt</sub></div>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                        <div className="grid_placeholder">
                            <div className="item_details_header">
                                <div>
                                    <div>{(19300175).toLocaleString()}<sup>mt</sup></div>
                                    <div>Entrance B - Tin Remaining</div>
                                </div>
                                <div>
                                    <Button className='dashboard_button_rounded'>
                                        <Image src="/dashboard/filter_icon_large.svg" width={18} height={18} alt='filter_icon' />
                                    </Button>
                                    <Button className='dashboard_button_rounded'>
                                        <Image src="/dashboard/cancel_icon.svg" width={18} height={18} alt='filter_icon' />
                                    </Button>
                                </div>
                            </div>
                            <div className="custom_tab_wrapper">
                                <div className="custom_tab_header">
                                    <Button className={`custom_tab_button ${currentTab === 1 ? 'current' : ''}`} onClick={() => handleTabSelection(1)}>S9</Button>
                                    <Button className={`custom_tab_button ${currentTab === 2 ? 'current' : ''}`} onClick={() => handleTabSelection(2)}>S10</Button>
                                    <Button className={`custom_tab_button ${currentTab === 3 ? 'current' : ''}`} onClick={() => handleTabSelection(3)}>S11</Button>
                                    <Button className={`custom_tab_button ${currentTab === 4 ? 'current' : ''}`} onClick={() => handleTabSelection(4)}>S12</Button>
                                </div>
                                <div className="custom_tab_body">
                                    {(currentTab !== null && currentTab === 1) && (
                                        <div className="custom_tab_content">
                                            S9
                                        </div>
                                    )}
                                    {(currentTab !== null && currentTab === 2) && (
                                        <div className="custom_tab_content">
                                            S10
                                        </div>
                                    )}
                                    {(currentTab !== null && currentTab === 3) && (
                                        <div className="custom_tab_content">
                                            S11
                                        </div>
                                    )}
                                    {(currentTab !== null && currentTab === 4) && (
                                        <div className="custom_tab_content">
                                            S12
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="dashboard_2_divider"></div>
                            <CustomAccordion headerTemplate={workerHeader} bodyTemplate={workerBody} />
                            <div className="dashboard_2_divider"></div>
                            <CustomAccordion headerTemplate={machineHeader} bodyTemplate={machineBody} expanded />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}