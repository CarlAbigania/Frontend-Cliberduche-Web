import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    FaBriefcase,
    FaPlus,
    FaEdit,
    FaTrash,
    FaImage,
    FaMapMarkerAlt,
    FaClock,
    FaSpinner,
    FaUser,
} from 'react-icons/fa';
import axios from '../../api/axios';

export default function ProjectManagement() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [allClients, setAllClients] = useState([]);       // all clients (for reference)
    const [approvedClients, setApprovedClients] = useState([]); // only approved
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState(null); // per‑image loading
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        client_id: '',
        name: '',
        description: '',
        location: '',
        year: new Date().getFullYear(),
        status: 'pending',
    });
    const [images, setImages] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ show: false, projectId: null });

    // Redirect if not authenticated or not admin
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchProjects();
        fetchClients();
    }, [token, user, navigate]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/projects');
            const projectsData = response.data.projects?.data || [];
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await axios.get('/auth/clients');
            const clientsData = response.data.clients || response.data;
            setAllClients(clientsData);
            setApprovedClients(clientsData.filter(client => client.account_status === 'approved'));
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'year' ? parseInt(value) || '' : value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ type: '', text: '' });

        // 👇 Frontend validation: selected client must be approved
        const selectedClient = allClients.find(c => c.id === parseInt(formData.client_id));
        if (!selectedClient || selectedClient.account_status !== 'approved') {
            setMessage({
                type: 'error',
                text: 'Selected client is not approved. Please choose an approved client.',
            });
            setActionLoading(false);
            return;
        }

        try {
            if (editingId) {
                // Update project
                await axios.put(`/projects/${editingId}`, formData);
                if (images.length > 0) {
                    const imageFormData = new FormData();
                    images.forEach((img) => imageFormData.append('images[]', img));
                    await axios.post(`/projects/${editingId}/images`, imageFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
                setMessage({ type: 'success', text: 'Project updated successfully!' });
            } else {
                // Create new project
                const formDataWithImages = new FormData();
                Object.keys(formData).forEach(key => formDataWithImages.append(key, formData[key]));
                images.forEach((img) => formDataWithImages.append('images[]', img));
                await axios.post('/projects', formDataWithImages, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessage({ type: 'success', text: 'Project created successfully!' });
            }

            // Reset form
            setFormData({
                client_id: '',
                name: '',
                description: '',
                location: '',
                year: new Date().getFullYear(),
                status: 'pending',
            });
            setImages([]);
            setEditingId(null);
            setShowForm(false);
            await fetchProjects();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to save project',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditProject = (project) => {
        // Prepare dropdown options: approved clients + possibly the current client if not approved
        setFormData({
            client_id: project.client_id,
            name: project.name,
            description: project.description,
            location: project.location,
            year: project.year,
            status: project.status,
        });
        setEditingId(project.id);
        setShowForm(true);
    };

    const handleDeleteProject = async () => {
        if (!deleteModal.projectId) return;
        setActionLoading(true);
        try {
            await axios.delete(`/projects/${deleteModal.projectId}`);
            setMessage({ type: 'success', text: 'Project deleted successfully' });
            setDeleteModal({ show: false, projectId: null });
            await fetchProjects();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete project' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        setDeletingImageId(imageId);
        try {
            await axios.delete(`/projects/images/${imageId}`);
            setMessage({ type: 'success', text: 'Image deleted successfully' });
            await fetchProjects();
            if (selectedProject) {
                const response = await axios.get(`/projects/${selectedProject.id}`);
                setSelectedProject(response.data.project);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete image' });
        } finally {
            setDeletingImageId(null);
        }
    };

    // Build dropdown options: approved clients + (if editing) the current client even if not approved
    const getClientOptions = () => {
        let options = [...approvedClients];
        if (editingId) {
            const currentClient = allClients.find(c => c.id === parseInt(formData.client_id));
            if (currentClient && currentClient.account_status !== 'approved') {
                // Add a copy with a visual indicator
                options.push({
                    ...currentClient,
                    display_name: `${currentClient.full_name} (${currentClient.email}) - Not Approved`,
                });
            }
        }
        return options;
    };

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
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center dark:text-slate-100">
                        <FaBriefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Project Management
                    </h2>
                    {!showForm && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    client_id: '',
                                    name: '',
                                    description: '',
                                    location: '',
                                    year: new Date().getFullYear(),
                                    status: 'pending',
                                });
                                setImages([]);
                                setShowForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            <FaPlus className="h-4 w-4" />
                            New Project
                        </button>
                    )}
                </div>

                {/* Message */}
                {message.text && (
                    <div
                        className={`mx-6 mt-4 p-3 rounded-lg text-sm border ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-4 dark:border-slate-700 dark:bg-slate-900">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Client dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                    Client *
                                </label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                                >
                                    <option value="">Select a client</option>
                                    {getClientOptions().map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.display_name || `${client.full_name} (${client.email})`}
                                        </option>
                                    ))}
                                </select>
                                {editingId && formData.client_id && allClients.find(c => c.id === parseInt(formData.client_id))?.account_status !== 'approved' && (
                                    <p className="text-xs text-red-600 mt-1 dark:text-red-400">
                                        This client is not approved. Saving will fail unless you change to an approved client.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                                Upload Images
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-slate-700 dark:file:text-slate-300 dark:hover:file:bg-slate-600"
                            />
                            {images.length > 0 && (
                                <p className="text-sm text-gray-600 mt-2 dark:text-slate-400">
                                    {images.length} file(s) selected
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-slate-600"
                            >
                                {actionLoading ? (
                                    <FaSpinner className="h-5 w-5 animate-spin inline" />
                                ) : (
                                    editingId ? 'Update Project' : 'Create Project'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Projects grid */}
            <div>
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <FaSpinner className="h-8 w-8 text-gray-400 animate-spin dark:text-slate-500" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center p-4 bg-white rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                        <FaBriefcase className="h-12 w-12 mb-3 opacity-50 dark:opacity-30" />
                        <p className="font-medium">No projects yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:shadow-lg"
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

                                    {/* Client info */}
                                    {project.client && (
                                        <div className="flex items-center text-gray-600 text-sm mb-2 dark:text-slate-400">
                                            <FaUser className="h-4 w-4 mr-2" />
                                            {project.client.full_name}
                                            {project.client.account_status !== 'approved' && (
                                                <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Not Approved)</span>
                                            )}
                                        </div>
                                    )}

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

                                    <p className="text-gray-700 text-sm line-clamp-2 mb-3 dark:text-slate-300">
                                        {project.description}
                                    </p>

                                    {project.images && project.images.length > 0 && (
                                        <div className="mb-3 text-gray-600 text-sm flex items-center dark:text-slate-400">
                                            <FaImage className="h-4 w-4 mr-2" />
                                            {project.images.length} image(s)
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                                        <button
                                            onClick={() => setSelectedProject(project)}
                                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30"
                                        >
                                            <FaImage className="h-4 w-4" />
                                            Images
                                        </button>
                                        <button
                                            onClick={() => handleEditProject(project)}
                                            className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/30"
                                        >
                                            <FaEdit className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ show: true, projectId: project.id })}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
                                        >
                                            <FaTrash className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Project detail with image management modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-opacity-70">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border dark:border-slate-700">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{selectedProject.name} - Images</h2>
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            {selectedProject.images && selectedProject.images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedProject.images.map((img) => (
                                        <div key={img.id} className="relative group">
                                            <img
                                                src={img.image_url}
                                                alt={img.caption || 'Project image'}
                                                className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                                            />
                                            {img.caption && (
                                                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{img.caption}</p>
                                            )}
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                disabled={deletingImageId === img.id}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
                                            >
                                                {deletingImageId === img.id ? (
                                                    <FaSpinner className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <FaTrash className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8 dark:text-slate-400">No images uploaded yet</p>
                            )}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
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

            {/* Delete project modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-opacity-70">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 dark:bg-slate-800 dark:border dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-100">Delete Project</h3>
                        <p className="text-gray-600 mb-6 dark:text-slate-400">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteProject}
                                disabled={actionLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors dark:bg-red-700 dark:hover:bg-red-800 dark:disabled:bg-slate-600"
                            >
                                {actionLoading ? <FaSpinner className="h-5 w-5 animate-spin inline" /> : 'Delete'}
                            </button>
                            <button
                                onClick={() => setDeleteModal({ show: false, projectId: null })}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}