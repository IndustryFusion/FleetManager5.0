import '../../public/styles/dashboard_2.css'
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { PiSteeringWheelFill } from "react-icons/pi";
import { FaHelmetSafety } from "react-icons/fa6";
import { BiSolidUpArrow } from 'react-icons/bi';
import Image from 'next/image';
import { useState } from 'react';
import { IoCubeSharp } from 'react-icons/io5';

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
    const [selectedCard, setSelectedCard] = useState<Card | null>(null)

    const handleCardSelection = (card: Card) => {
        setSelectedCard(card);
        console.log(card)
    }

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("Button clicked! Default and propagation prevented.");
    };

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

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}