import '../../public/styles/dashboard_1.css'
import { useState } from "react";
import { Tree, TreeNodeTemplateOptions } from "primereact/tree";
import { Button } from "primereact/button";
import Image from "next/image";
import { MultiSelect } from "primereact/multiselect";
import { InputSwitch } from "primereact/inputswitch";
import { Calendar } from "primereact/calendar";
import { RiArrowDownDoubleLine, RiArrowUpDoubleLine } from "react-icons/ri";
import { LuAlignLeft, LuListFilter } from "react-icons/lu";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';

interface User {
    name: string;
    picture: string;
    revenue: string;
    percentage: string;
}

export default function DashboardOne() {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [timeSwitch, setTimeSwitch] = useState<boolean>(true);
    const [expandedRows, setExpandedRows] = useState(null);
    const [dateRange, setDateRange] = useState<[Date, Date,]>([
        new Date(2024, 8, 1),
        new Date(2024, 10, 30)
    ]);
    const users = [
        { name: 'Harry P.', picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNEJCb0NV9_cJ76XLnqQ0i2Tz7JXH7SMx5Uw&s', revenue: '$156,841', percentage: '32.33', leads: '410' },
        { name: 'Parry H.', picture: '', revenue: '$209,663', percentage: '40.53', leads: '210' },
        { name: 'Armin A.', picture: '', revenue: '$117,115', percentage: '27.14', leads: '270' },
        { name: 'Lara C.', picture: '', revenue: '$88,574', percentage: '18.12', leads: '190' },
        { name: 'Ethan M.', picture: '', revenue: '$134,907', percentage: '18.88', leads: '250' }
    ];


    const [nodes] = useState([
        {
            key: '0',
            label: 'Sales list',
            selectable: false,
        },
        {
            key: '1',
            label: 'Goals',
            selectable: false,
        },
        {
            key: '2',
            label: 'Dashboard',
            children: [
                {
                    key: '2-0',
                    label: 'Codename',
                    selectable: false,
                },
                {
                    key: '2-1',
                    label: 'Shared with me',
                    children: [
                        { key: '2-1-0', label: 'Cargo2go' },
                        { key: '2-1-1', label: 'Cloudz3r' },
                        { key: '2-1-2', label: 'Idioma' },
                        { key: '2-1-3', label: 'Syllables' },
                    ],
                },
                {
                    key: '2-2',
                    label: 'x-Ob',
                },
            ],
        },
        {
            key: '3',
            label: 'Reports',
            children: [
                {
                    key: '3-0',
                    label: 'Share with me',
                    children: [
                        { key: '3-0-0', label: 'Deals by user' },
                        { key: '3-0-1', label: 'Deal duration' },
                    ],
                },
                {
                    key: '3-1',
                    label: 'My reports',
                    children: [
                        { key: '3-1-0', label: 'Emails received' },
                        { key: '3-1-1', label: 'Deal duration' },
                        { key: '3-1-2', label: 'New report' },
                        { key: '3-1-3', label: 'Analytics' },
                    ],
                },
            ],
        },
    ]);

    const nodeTemplate = (node: any, options: TreeNodeTemplateOptions) => {
        return (
            <div className="p-tree-node-content" onClick={options.onTogglerClick}>
                <span className="p-tree-toggler">
                    {options.expanded ? (
                        <i className="pi pi-chevron-up custom-icon"></i>
                    ) : (
                        <i className="pi pi-chevron-down custom-icon"></i>
                    )}
                </span>
                <span className="p-tree-node-label">{node.label}</span>
            </div>
        );
    };
    const formatRange = (range: [Date, Date] | null): string => {
        if (!range || range.length !== 2 || !range[0] || !range[1]) return '';
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        const [start, end] = range;
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString(
            'en-US',
            options
        )}, ${start.getFullYear()}`;
    };

    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="expansion_card">
                <div className="expansion_chips">
                    <div>Top sales 💪</div>
                    <div>Sales streak 🔥</div>
                    <div>Top review 👍</div>
                </div>
                <div className="expansion_percentage_wrapper">
                    <div>Performance summary</div>
                    <div>
                        <div className="revenue_chip"><RiArrowUpDoubleLine width={14} height={14} />{data.leads}</div>
                        <div className="revenue_chip"><RiArrowUpDoubleLine width={14} height={14} />{data.revenue}</div>
                    </div>
                </div>
                <div className="expansion_bento_grid">
                    <div>
                        <div>
                            <div className="user_chip">
                                {data.picture ? (
                                    <img
                                        src={data.picture}
                                        alt={data.name}
                                        className="user_chip_avatar"
                                    />
                                ) : (
                                    <span className="user_chip_avatar">
                                        {data.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className="user_chip_name">{data.name}</span>
                            </div>
                            <div>
                                <div className="revenue_chip"><RiArrowUpDoubleLine width={14} height={14} />{data.leads}</div>
                                <div className="revenue_chip"><RiArrowUpDoubleLine width={14} height={14} />{data.revenue}</div>
                            </div>
                        </div>
                        <div>{data.revenue}</div>
                    </div>
                    <div>
                        <div>Leads</div>
                        <div>{data.leads}</div>
                    </div>
                    <div>
                        <div>KPI</div>
                        <div>{data.percentage}%</div>
                    </div>
                    <div>
                        <div>Revenue</div>
                        <div>{data.revenue}</div>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="flex">
            <Sidebar />
            <div className="main_content_wrapper">
                <div className="navbar_wrapper">
                    <Navbar navHeader="Dashboard" />
                </div>
                <div className="dashboard_content">
                    <div className="tree_wrapper">
                        <Tree value={nodes} className="custom-tree" nodeTemplate={nodeTemplate} />
                    </div>
                    <div className="dashboard_grid">
                        <div className="dashboard_grid_content">
                            <div className="user_actions">
                                <div className="user_card">
                                    <MultiSelect value={selectedUsers} onChange={(e) => setSelectedUsers(e.value)} options={users} optionLabel="name"
                                        placeholder="Select Cities" maxSelectedLabels={3} className="add_user_dropdown" dropdownIcon="add_user_dropdown_icon" panelClassName="add_user_dropdown_panel" />
                                    <div className="user_chips_wrapper">
                                        {selectedUsers?.map((user: { name: string; picture: string }, index: number) => (
                                            <div className="user_chip">
                                                {user.picture ? (
                                                    <img
                                                        src={user.picture}
                                                        alt={user.name}
                                                        className="user_chip_avatar"
                                                    />
                                                ) : (
                                                    <span className="user_chip_avatar">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="user_chip_name">{user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="dashboard_actions_card">
                                    <Button className="dashboard_action_button">
                                        <Image src="/dashboard/filter_icon.svg" width={20} height={20} alt="filter"></Image>
                                    </Button>
                                    <Button className="dashboard_action_button">
                                        <Image src="/dashboard/download_icon.svg" width={20} height={20} alt="download"></Image>
                                    </Button>
                                    <Button className="dashboard_action_button">
                                        <Image src="/dashboard/upload_icon.svg" width={20} height={20} alt="export"></Image>
                                    </Button>
                                </div>
                            </div>
                            <div className="dashboard_title_wrapper">
                                <h1>New Report</h1>
                                <div className="dashboard_calendar_group">
                                    <div className="time_switch_wrapper">
                                        <InputSwitch id="switch" checked={timeSwitch} onChange={(e) => setTimeSwitch(e.target.value)} className="time_switch" />
                                        <label htmlFor="switch">Timeframe</label>
                                    </div>
                                    <div className="dashboard_calendar_wrapper">
                                        <Calendar
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.value)}
                                            selectionMode="range"
                                            className="dashboard_calendar"
                                            placeholder={formatRange(dateRange)}
                                            dateFormat="M d, yy"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="revenue_wrapper">
                                <div>
                                    <div className="revenue_price">$528,976<span style={{ color: '#c4c4c4' }}>.82</span><span className="revenue_chip"><RiArrowUpDoubleLine width={16} height={16} /> 7.9%</span> <span className="revenue_chip">$27,335.09</span></div>
                                    <div className="revenue_sub_wrapper">
                                        <div className="revenue_sub">vs prev. $501,556.73</div>
                                        <Calendar className="revenue_sub_calendar" value={dateRange}
                                            onChange={(e) => setDateRange(e.value)}
                                            selectionMode="range"
                                            placeholder={formatRange(dateRange)}
                                            dateFormat="M d, yy" />
                                    </div>
                                </div>
                                <div className="revenue_card_grid">
                                    <div className="revenue_card">
                                        <div>
                                            Top Sales
                                        </div>
                                        <div>73</div>
                                        <div>
                                            <div>Rolf Inc.</div>
                                            <div><Image src="/dashboard/arrow_right.svg" width={18} height={18} alt="" /></div>
                                        </div>
                                    </div>
                                    <div className="revenue_card dark">
                                        <div>
                                            Best deal
                                        </div>
                                        <div>$42,300</div>
                                        <div>
                                            <div>Rolf Inc.</div>
                                            <div><Image src="/dashboard/arrow_right.svg" width={18} height={18} alt="" /></div>
                                        </div>
                                    </div>
                                    <div className="revenue_card small">
                                        <div>
                                            Deals
                                        </div>
                                        <div className="revenue_chip grey">256</div>
                                        <div>
                                            <RiArrowDownDoubleLine width={16} height={16} />
                                            <div>5</div>
                                        </div>
                                    </div>
                                    <div className="revenue_card small accent">
                                        <div>
                                            Value
                                        </div>
                                        <div className="revenue_chip">528k</div>
                                        <div>
                                            <RiArrowUpDoubleLine width={16} height={16} />
                                            <div>7.9%</div>
                                        </div>
                                    </div>
                                    <div className="revenue_card small">
                                        <div>
                                            Win rate
                                        </div>
                                        <div className="revenue_chip grey">44%</div>
                                        <div>
                                            <RiArrowDownDoubleLine width={16} height={16} />
                                            <div>1.2%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="user_percentage_wrapper">
                                <div className="user_percentage_track">
                                    {selectedUsers.map((user, index) => (
                                        <div key={index} className="user_percentage_chip" style={{ width: `${user.percentage}%` }}>

                                            <div>
                                                {user.picture ? (
                                                    <img
                                                        src={user.picture}
                                                        alt={user.name}
                                                        className="user_chip_avatar"
                                                    />
                                                ) : (
                                                    <span className="user_chip_avatar">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="user_chip_name">{user.revenue}</span>
                                            </div>
                                            <div style={{ color: '#c4c4c4' }}>{user.percentage}%</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="dashboard_button">Details</button>
                            </div>
                            <div className="dashboard_bento_grid">
                                <div className="dashboard_bento_wrapper">
                                    <div className="dashboard_bento_card">
                                        <div className="bento_card_header">
                                            <button><LuAlignLeft /><Image src="/dashboard/arrow_down.svg" width={20} height={20} alt="filter"></Image></button>
                                            <button className="bento_card_filter"><div>Filters</div><LuListFilter /></button>
                                        </div>
                                        <div className="bento_chart_wrapper">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                                    <div className="dashboard_bento_card"><div className="bento_card_header">
                                        <button><LuAlignLeft /><Image src="/dashboard/arrow_down.svg" width={20} height={20} alt="filter"></Image></button>
                                        <button className="bento_card_filter"><div>Filters</div><LuListFilter /></button>
                                    </div>
                                        <div className="bento_chart_wrapper">
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div></div>
                                    <div className="dashboard_bento_card"></div>
                                </div>
                                <div className="bento_table_wrapper">
                                    <DataTable
                                        value={users.map((user, index) => ({ ...user, id: index }))}
                                        expandedRows={expandedRows}
                                        onRowToggle={(e) => setExpandedRows(e.data)}
                                        rowExpansionTemplate={rowExpansionTemplate}
                                        dataKey="id"
                                        className="dashboard_table"
                                    >
                                        <Column field="name" header="Name" />
                                        <Column field="revenue" header="Revenue" />
                                        <Column field="leads" header="Leads" />
                                        <Column field="percentage" header="KPI" />
                                        <Column expander />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}