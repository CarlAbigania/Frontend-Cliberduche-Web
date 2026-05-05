    import React, { useState, useEffect } from 'react';
    import { useAuth } from '../../context/AuthContext';
    import { useNavigate } from 'react-router-dom';
    import {
        FaBriefcase,
        FaImage,
        FaMapMarkerAlt,
        FaClock,
        FaSpinner,
        FaUser,
    } from 'react-icons/fa';
    import axios from '../../api/axios';

    export default function ClientProjects() {
        const { token, user, isApproved, isPending, isRejected } = useAuth();
        const navigate = useNavigate();
        const [projects, setProjects] = useState([]);
        const [loading, setLoading] = useState(true);
        const [filter, setFilter] = useState('all');
        const [selectedProject, setSelectedProject] = useState(null);
        const [accessError, setAccessError] = useState('');

        useEffect(() => {
            if (!token) {
                navigate('/login');
                return;
            }

            if (user) {
                if (isApproved) {
                    setAccessError('');
                    fetchProjects();
                } else {
                    setLoading(false);
                    if (isPending) {
                        setAccessError('Your account is pending approval. Please wait for admin to approve your account.');
                    } else if (isRejected) {
                        setAccessError('Your account has been rejected. Please update your profile information.');
                    } else {
                        setAccessError('Your account is not approved.');
                    }
                }
            }
        }, [token, user, isApproved, isPending, isRejected, navigate]);

        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/projects');
                // Handle paginated response
                const projectsData = response.data.projects?.data || [];
                setProjects(projectsData);
            } catch (error) {
                if (error.response?.status === 403) {
                    setAccessError('You do not have permission to access projects. Please check your account status.');
                } else {
                    console.error('Error fetching projects:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        const filterOptions = ['all', 'pending', 'ongoing', 'completed', 'cancelled'];

        const filteredProjects = projects.filter((project) => {
            if (filter === 'all') return true;
            return project.status === filter;
        });

        const getStatusColor = (status) => {
            switch (status) {
                case 'ongoing':
                    return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800';
                case 'completed':
                    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800';
                case 'pending':
                    return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-800';
                case 'cancelled':
                    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800';
                default:
                    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
            }
        };

        return (
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6 dark:bg-slate-800 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-slate-100">
                            <FaBriefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            My Projects
                        </h2>
                    </div>

                    {/* Access Error Message */}
                    {accessError && (
                        <div className="p-6">
                            <div
                                className={`p-4 rounded-lg ${isRejected
                                        ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                    }`}
                            >
                                {accessError}
                            </div>
                        </div>
                    )}

                    {/* Filter tabs (only if approved) */}
                    {isApproved && !accessError && (
                        <div className="px-6 py-3 flex gap-2 border-t border-gray-200 overflow-x-auto flex-wrap dark:border-slate-700">
                            {filterOptions.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === status
                                            ? 'bg-blue-600 text-white dark:bg-blue-700'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)} (
                                    {status === 'all'
                                        ? projects.length
                                        : projects.filter((p) => p.status === status).length}
                                    )
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Projects grid */}
                {isApproved && !accessError && (
                    <div>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <FaSpinner className="h-8 w-8 text-gray-400 animate-spin dark:text-slate-500" />
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center p-4 bg-white rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                                <FaBriefcase className="h-12 w-12 mb-3 opacity-50 dark:opacity-30" />
                                <p className="font-medium">No projects found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-lg"
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 bg-gray-200 overflow-hidden dark:bg-slate-700">
                                            {project.images && project.images.length > 0 ? (
                                                <img
                                                    src={project.images[0].image_url}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-slate-600">
                                                    <FaImage className="h-12 w-12 text-gray-500 dark:text-slate-400" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                                        project.status
                                                    )}`}
                                                >
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-slate-100">
                                                {project.name}
                                            </h3>

                                            {project.location && (
                                                <div className="flex items-center text-gray-600 text-sm mb-2 dark:text-slate-400">
                                                    <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                                                    {project.location}
                                                </div>
                                            )}

                                            {project.year && (
                                                <div className="flex items-center text-gray-600 text-sm mb-3 dark:text-slate-400">
                                                    <FaClock className="h-4 w-4 mr-2" />
                                                    {project.year}
                                                </div>
                                            )}

                                            <p className="text-gray-700 text-sm line-clamp-3 dark:text-slate-300">
                                                {project.description}
                                            </p>

                                            {project.images && project.images.length > 0 && (
                                                <div className="mt-3 flex items-center text-gray-600 text-sm dark:text-slate-400">
                                                    <FaImage className="h-4 w-4 mr-2" />
                                                    {project.images.length} image(s)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Project detail modal */}
                {isApproved && !accessError && selectedProject && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border dark:border-slate-700">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{selectedProject.name}</h2>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Images gallery */}
                                {selectedProject.images && selectedProject.images.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-slate-100">Gallery</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedProject.images.map((img) => (
                                                <div key={img.id} className="relative">
                                                    <img
                                                        src={img.image_url}
                                                        alt={img.caption || 'Project image'}
                                                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                                                    />
                                                    {img.caption && (
                                                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                                                            {img.caption}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {selectedProject.description && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 dark:text-slate-100">Description</h3>
                                        <p className="text-gray-700 text-sm leading-relaxed dark:text-slate-300">
                                            {selectedProject.description}
                                        </p>
                                    </div>
                                )}

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                                    {selectedProject.location && (
                                        <div>
                                            <p className="text-xs text-gray-600 uppercase font-semibold dark:text-slate-400">Location</p>
                                            <p className="text-sm text-gray-900 mt-1 flex items-center dark:text-slate-200">
                                                <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                                                {selectedProject.location}
                                            </p>
                                        </div>
                                    )}
                                    {selectedProject.year && (
                                        <div>
                                            <p className="text-xs text-gray-600 uppercase font-semibold dark:text-slate-400">Year</p>
                                            <p className="text-sm text-gray-900 mt-1 flex items-center dark:text-slate-200">
                                                <FaClock className="h-4 w-4 mr-2" />
                                                {selectedProject.year}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase font-semibold dark:text-slate-400">Status</p>
                                        <p className="text-sm text-gray-900 mt-1 capitalize dark:text-slate-200">
                                            {selectedProject.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase font-semibold dark:text-slate-400">Created By</p>
                                        <p className="text-sm text-gray-900 mt-1 dark:text-slate-200">
                                            {selectedProject.creator?.full_name || 'Unknown'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setSelectedProject(null)}
                                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }