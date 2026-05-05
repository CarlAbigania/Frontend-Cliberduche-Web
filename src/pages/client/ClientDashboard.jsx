import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaCheck,
    FaClock,
    FaTimes,
    FaInfinity,
    FaCalendar,
    FaBriefcase,
    FaBell,
    FaSpinner,
    FaEnvelope,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

export default function ClientDashboard() {
    const { user, isApproved, isPending, isRejected, hasPendingChanges } = useAuth();
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        projects: 0,
        unreadNotifications: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isApproved) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [isApproved]);

    const fetchStats = async () => {
        try {
            const [appointmentsRes, projectsRes, notificationsRes] = await Promise.all([
                axios.get('/appointments'),
                axios.get('/projects'),
                axios.get('/notifications/unread/count'),
            ]);

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

            const upcomingCount = appointmentsData.filter(
                (apt) => apt.status !== 'cancelled' && apt.status !== 'completed',
            ).length;

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
                upcomingAppointments: upcomingCount,
                projects: projectsData.length,
                unreadNotifications: notificationsRes.data?.count || 0,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (isApproved) {
            return (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30">
                    Approved
                </span>
            );
        }
        if (isPending) {
            return (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30">
                    Pending
                </span>
            );
        }
        if (isRejected) {
            return (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30">
                    Rejected
                </span>
            );
        }
        return null;
    };

    const getStatusIcon = () => {
        if (isApproved) return <FaCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
        if (isPending) return <FaClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
        if (isRejected) return <FaTimes className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
        return null;
    };

    const getStatusBg = () => {
        if (isApproved) return 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-800/50';
        if (isPending) return 'bg-amber-50/80 border-amber-200 dark:bg-amber-500/10 dark:border-amber-800/50';
        if (isRejected) return 'bg-rose-50/80 border-rose-200 dark:bg-rose-500/10 dark:border-rose-800/50';
        return 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700';
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
                            <span>Client Dashboard</span>
                        </div>
                        <h1 className="text-2xl font-semibold md:text-3xl">
                            Hi, {user?.firstname}!
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-emerald-50/90">
                            Track your appointments, projects, and messages with a clear overview of your
                            account.
                        </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-md">
                        <div className="grid grid-cols-1 gap-2 text-emerald-50 md:grid-cols-2">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100/80">
                                    Full Name
                                </p>
                                <p className="mt-1 text-xs font-medium">
                                    {user?.firstname} {user?.lastname}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100/80">
                                    Status
                                </p>
                                <div className="mt-1">{getStatusBadge()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`overflow-hidden rounded-2xl border shadow-sm ${getStatusBg()} bg-white/90 dark:bg-slate-900/90`}>
                <div className="flex items-start gap-4 px-6 py-5">
                    <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                : isPending
                                ? 'bg-amber-100 dark:bg-amber-500/20'
                                : 'bg-rose-100 dark:bg-rose-500/20'
                        }`}
                    >
                        {getStatusIcon()}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            Account Status:{' '}
                            <span className="capitalize">
                                {isApproved ? 'approved' : isPending ? 'pending' : 'rejected'}
                            </span>
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {isApproved
                                ? 'Your account is fully approved. You can book appointments, view projects, and receive notifications.'
                                : isPending
                                ? 'Your account is under review. You can still update your profile. We will email you once the review is complete.'
                                : 'Your registration was declined. Please review your information and update your profile to resubmit.'}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Link
                            to="/profile"
                            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                                isApproved
                                    ? 'bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                                    : 'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800'
                            }`}
                        >
                            {isApproved ? 'View Profile' : 'Update Profile'}
                        </Link>
                    </div>
                </div>
            </section>

            {hasPendingChanges && (
                <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-900/50 dark:text-sky-200">
                    <FaClock className="h-4 w-4 flex-shrink-0" />
                    <span>Your recent profile changes are being reviewed by an administrator.</span>
                </div>
            )}

            {isApproved && (
                <>
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                Overview
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                icon={FaCalendar}
                                label="Upcoming Appointments"
                                value={stats.upcomingAppointments}
                                accent="border-sky-300/70 bg-sky-50/70 text-sky-800 dark:border-sky-400/50 dark:bg-sky-500/10 dark:text-sky-200"
                                link="/client/appointments"
                            />
                            <StatCard
                                icon={FaBriefcase}
                                label="Your Projects"
                                value={stats.projects}
                                accent="border-indigo-300/70 bg-indigo-50/70 text-indigo-800 dark:border-indigo-400/50 dark:bg-indigo-500/10 dark:text-indigo-200"
                                link="/client/projects"
                            />
                            <StatCard
                                icon={FaBell}
                                label="Unread Notifications"
                                value={stats.unreadNotifications}
                                accent="border-rose-300/70 bg-rose-50/70 text-rose-800 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-200"
                                link="/notifications"
                            />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/80">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    <FaInfinity className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                        Quick Actions
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Shortcuts to what you do most often.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-3 p-6 md:grid-cols-2">
                            <Link
                                to="/client/appointments"
                                className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-sky-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                            >
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                                    <FaCalendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                        Book Appointment
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Choose a date and time that works for you.
                                    </p>
                                </div>
                            </Link>
                            <Link
                                to="/client/projects"
                                className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-indigo-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                            >
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                                    <FaBriefcase className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                        View Projects
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Browse your projects and see their status.
                                    </p>
                                </div>
                            </Link>
                            <Link
                                to="/messages"
                                className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-emerald-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                            >
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    <FaEnvelope className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                        Messages
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Chat with the Cliberduche team.
                                    </p>
                                </div>
                            </Link>
                            <Link
                                to="/activity-history"
                                className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm transition-all hover:-translate-y-[2px] hover:border-slate-500/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
                            >
                                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200">
                                    <FaClock className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                                        Activity History
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        See what happened on your account.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}