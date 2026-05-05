import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaInfinity,
    FaUsers,
    FaCalendar,
    FaBriefcase,
    FaClipboardList,
    FaSpinner,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pendingClients: 0,
        approvedClients: 0,
        totalAppointments: 0,
        totalProjects: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [clientsRes, appointmentsRes, projectsRes] = await Promise.all([
                axios.get('/auth/clients'),
                axios.get('/appointments'),
                axios.get('/projects'),
            ]);

            const allClients = clientsRes.data.clients || [];
            const approved = allClients.filter((c) => c.account_status === 'approved').length;
            const pending = allClients.filter((c) => c.account_status === 'pending').length;

            let appointmentsData = [];
            const aptData = appointmentsRes.data;
            if (aptData && aptData.appointments) {
                if (aptData.appointments.data && Array.isArray(aptData.appointments.data)) {
                    appointmentsData = aptData.appointments.data;
                } else if (Array.isArray(aptData.appointments)) {
                    appointmentsData = aptData.appointments;
                }
            } else if (Array.isArray(aptData)) {
                appointmentsData = aptData;
            }

            let projectsData = [];
            const projData = projectsRes.data;
            if (projData && projData.projects) {
                if (projData.projects.data && Array.isArray(projData.projects.data)) {
                    projectsData = projData.projects.data;
                } else if (Array.isArray(projData.projects)) {
                    projectsData = projData.projects;
                }
            } else if (Array.isArray(projData)) {
                projectsData = projData;
            }

            setStats({
                pendingClients: pending,
                approvedClients: approved,
                totalAppointments: appointmentsData.length,
                totalProjects: projectsData.length,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, accent, link }) => (
        <Link
            to={link}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-sky-50/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-500/5 dark:to-sky-500/5" />
            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                        {loading ? (
                            <FaSpinner className="h-6 w-6 animate-spin text-slate-300 dark:text-slate-500" />
                        ) : (
                            value
                        )}
                    </p>
                </div>
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg shadow-sm ${accent}`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </Link>
    );

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-emerald-500 via-emerald-500 to-sky-500 px-6 py-6 text-white shadow-sm dark:border-slate-700 dark:from-emerald-500 dark:via-emerald-600 dark:to-sky-600">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em]">
                            <FaInfinity className="h-4 w-4" />
                            <span>Admin Overview</span>
                        </div>
                        <h1 className="text-2xl font-semibold md:text-3xl">
                            Welcome, {user?.firstname || user?.name}!
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
                            Monitor client onboarding, appointments, and projects in one clean workspace.
                        </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-md">
                        <div className="grid grid-cols-1 gap-2 text-emerald-50 md:grid-cols-2">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100/80">
                                    Email
                                </p>
                                <p className="mt-1 break-all text-xs font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100/80">
                                    Role
                                </p>
                                <p className="mt-1 text-xs font-medium capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Key Metrics
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={FaUsers}
                        label="Pending Clients"
                        value={stats.pendingClients}
                        accent="border-amber-300/70 bg-amber-50/70 text-amber-800 dark:border-amber-400/50 dark:bg-amber-500/10 dark:text-amber-200"
                        link="/admin/clients"
                    />
                    <StatCard
                        icon={FaUsers}
                        label="Approved Clients"
                        value={stats.approvedClients}
                        accent="border-emerald-300/70 bg-emerald-50/70 text-emerald-800 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-200"
                        link="/admin/clients"
                    />
                    <StatCard
                        icon={FaCalendar}
                        label="Total Appointments"
                        value={stats.totalAppointments}
                        accent="border-sky-300/70 bg-sky-50/70 text-sky-800 dark:border-sky-400/50 dark:bg-sky-500/10 dark:text-sky-200"
                        link="/admin/appointments"
                    />
                    <StatCard
                        icon={FaBriefcase}
                        label="Total Projects"
                        value={stats.totalProjects}
                        accent="border-indigo-300/70 bg-indigo-50/70 text-indigo-800 dark:border-indigo-400/50 dark:bg-indigo-500/10 dark:text-indigo-200"
                        link="/admin/projects"
                    />
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <FaClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                Quick Actions
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Jump into your most common admin tasks.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid gap-3 p-6 md:grid-cols-2">
                    <Link
                        to="/admin/clients"
                        className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-emerald-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                    >
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <FaUsers className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                Manage Clients
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Approve, reject, or review client accounts and documents.
                            </p>
                        </div>
                    </Link>
                    <Link
                        to="/admin/appointments"
                        className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-sky-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                    >
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                            <FaCalendar className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                View Appointments
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Confirm, complete, or cancel scheduled client visits.
                            </p>
                        </div>
                    </Link>
                    <Link
                        to="/admin/projects"
                        className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-indigo-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                    >
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                            <FaBriefcase className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                Manage Projects
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Create and update portfolio projects and assets.
                            </p>
                        </div>
                    </Link>
                    <Link
                        to="/activity-history"
                        className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-slate-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                    >
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200">
                            <FaClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                Activity Logs
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Review system and user actions across the platform.
                            </p>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}