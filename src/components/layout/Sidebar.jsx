import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaBars,
    FaChevronLeft,
    FaHome,
    FaUsers,
    FaCalendar,
    FaCalendarAlt,
    FaBriefcase,
    FaClock
} from 'react-icons/fa';
import logo from '/logo/cliberduche_logo.png';

const sidebarGroups = {
    admin: [
        {
            title: 'Overview',
            items: [
                { key: 'dashboard', label: 'Dashboard', icon: FaHome, href: '/admin' },
            ]
        },
        {
            title: 'Booking',
            items: [
                { key: 'appointments', label: 'Appointments', icon: FaCalendar, href: '/admin/appointments' },
                { key: 'schedules', label: 'Schedule Management', icon: FaCalendarAlt, href: '/admin/schedules' },
            ]
        },
        {
            title: 'Management',
            items: [
                { key: 'clients', label: 'Client Management', icon: FaUsers, href: '/admin/clients' },
                { key: 'projects', label: 'Projects', icon: FaBriefcase, href: '/admin/projects' },
            ]
        },
        {
            title: 'System',
            items: [
                { key: 'activity', label: 'Activity Logs', icon: FaClock, href: '/activity-history' },
            ]
        }
    ],
    client: [
        {
            title: 'Overview',
            items: [
                { key: 'dashboard', label: 'Dashboard', icon: FaHome, href: '/client' },
            ]
        },
        {
            title: 'My',
            items: [
                { key: 'appointments', label: 'Appointments', icon: FaCalendar, href: '/client/appointments' },
                { key: 'projects', label: 'Projects', icon: FaBriefcase, href: '/client/projects' },
            ]
        },
        {
            title: 'System',
            items: [
                { key: 'activity', label: 'Activity', icon: FaClock, href: '/activity-history' },
            ]
        }
    ]
};

export default function Sidebar({ role, sidebarOpen, toggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const groups = sidebarGroups[role] || [];

    return (
        <aside
            className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
                w-64
                border-r border-slate-800/70 bg-slate-950/95 text-slate-200 shadow-xl shadow-slate-950/60 backdrop-blur-xl`}
        >
            {/* Header section – alignment changes based on sidebarOpen */}
            <div className={`flex items-center px-4 py-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {sidebarOpen && (
                    <button
                        onClick={() => navigate(role === 'admin' ? '/admin' : '/client')}
                        className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/80 px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 shadow-sm hover:border-emerald-400 hover:text-emerald-300"
                    >
                        <img src={logo} alt="Cliberduche" className="h-7 w-auto" />
                        <span className="hidden md:inline">
                            {role === 'admin' ? 'Admin' : 'Client'}
                        </span>
                    </button>
                )}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/80 bg-slate-900/80 text-slate-400 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-300"
                    aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {sidebarOpen ? <FaChevronLeft className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
                </button>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-6 pt-2">
                {groups.map((group) => (
                    <div key={group.title}>
                        {sidebarOpen && group.title && (
                            <h3 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => navigate(item.href)}
                                        className={`group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
                                                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/60'
                                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-50'
                                            } ${!sidebarOpen ? 'justify-center' : ''}`}
                                        title={item.label}
                                    >
                                        <item.icon
                                            className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-500 group-hover:text-slate-200'
                                                }`}
                                        />
                                        {sidebarOpen && (
                                            <span className="ml-3 truncate">
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}