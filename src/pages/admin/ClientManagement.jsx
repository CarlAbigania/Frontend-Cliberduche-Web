import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaUserCheck,
  FaUserClock,
  FaTimes,
  FaUsers,
  FaCheck,
  FaEdit,
  FaTrash,
  FaDownload,
  FaImage,
  FaSpinner,
  FaSearch,
} from 'react-icons/fa';
import {
  getAllClients,
  approveClient,
  rejectClient,
  editClient,
  deleteClient,
} from '../../api/axios';

export default function ClientManagement() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [allClients, setAllClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const [rejectModal, setRejectModal] = useState({ show: false, clientId: null, reason: '' });
  const [viewModal, setViewModal] = useState({ show: false, client: null });
  const [editModal, setEditModal] = useState({
    show: false,
    clientId: null,
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    contact_number: '',
    valid_id: null,
    profile_image: null,
    valid_id_preview: null,
    profile_image_preview: null,
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, clientId: null, clientName: '' });

  // 🔍 FIX #1: Apply search filter FIRST, then derive status-based lists
  const searchedClients = useMemo(() => {
    if (!searchTerm.trim()) return allClients;
    const term = searchTerm.toLowerCase();
    return allClients.filter(
      c =>
        c.firstname?.toLowerCase().includes(term) ||
        c.middlename?.toLowerCase().includes(term) ||
        c.lastname?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.contact_number?.includes(term) ||
        c.id?.toString().includes(term)
    );
  }, [allClients, searchTerm]);

  // Derive status lists from SEARCHED results (not raw allClients)
  const pendingClients = useMemo(
    () => searchedClients.filter(c => c.account_status === 'pending'),
    [searchedClients]
  );
  const approvedClients = useMemo(
    () => searchedClients.filter(c => c.account_status === 'approved'),
    [searchedClients]
  );
  const rejectedClients = useMemo(
    () => searchedClients.filter(c => c.account_status === 'rejected'),
    [searchedClients]
  );

  // "All" tab uses the searched results directly
  const filteredAllClients = searchedClients;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [token, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getAllClients();
      setAllClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Failed to load clients. Please try again.');
      setAllClients([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Action Handlers ---
  const handleApprove = async (clientId) => {
    setProcessingId(clientId);
    try {
      const { data } = await approveClient(clientId);
      setAllClients(prev =>
        prev.map(c => (c.id === clientId ? data.client : c))
      );
      alert(data.message || 'Client approved successfully!');
    } catch (error) {
      console.error('Approve error:', error);
      const message = error.response?.data?.message || 'Approval failed. Please try again.';
      alert(message);
      await fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (clientId) => {
    setRejectModal({ show: true, clientId, reason: '' });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) return;
    setProcessingId(rejectModal.clientId);
    try {
      const { data } = await rejectClient(rejectModal.clientId, {
        reason: rejectModal.reason,
      });
      setAllClients(prev =>
        prev.map(c => (c.id === rejectModal.clientId ? data.client : c))
      );
      setRejectModal({ show: false, clientId: null, reason: '' });
      alert(data.message || 'Client rejected successfully!');
    } catch (error) {
      console.error('Reject error:', error);
      const message = error.response?.data?.message || 'Rejection failed. Please try again.';
      alert(message);
      await fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const openViewModal = (client) => {
    setViewModal({ show: true, client });
  };

  const openEditModal = (client) => {
    setEditModal({
      show: true,
      clientId: client.id,
      firstname: client.firstname || '',
      middlename: client.middlename || '',
      lastname: client.lastname || '',
      email: client.email || '',
      contact_number: client.contact_number || '',
      valid_id: null,
      profile_image: null,
      valid_id_preview: client.valid_id_url || null,
      profile_image_preview: client.profile_image_url || null,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'valid_id') {
      const file = files[0];
      setEditModal(prev => ({
        ...prev,
        valid_id: file,
        valid_id_preview: file ? URL.createObjectURL(file) : prev.valid_id_preview,
      }));
    } else if (name === 'profile_image') {
      const file = files[0];
      setEditModal(prev => ({
        ...prev,
        profile_image: file,
        profile_image_preview: file ? URL.createObjectURL(file) : prev.profile_image_preview,
      }));
    } else {
      setEditModal(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditConfirm = async () => {
    if (!editModal.firstname.trim() || !editModal.lastname.trim() || !editModal.email.trim())
      return;

    setProcessingId(editModal.clientId);
    try {
      const formData = new FormData();
      formData.append('firstname', editModal.firstname);
      if (editModal.middlename) formData.append('middlename', editModal.middlename);
      formData.append('lastname', editModal.lastname);
      formData.append('email', editModal.email);
      formData.append('contact_number', editModal.contact_number);
      if (editModal.valid_id) formData.append('valid_id', editModal.valid_id);
      if (editModal.profile_image) formData.append('profile_image', editModal.profile_image);

      const { data } = await editClient(editModal.clientId, formData);
      setAllClients(prev =>
        prev.map(c => (c.id === editModal.clientId ? data.client : c))
      );
      closeEditModal();
      alert(data.message || 'Client updated successfully!');
    } catch (error) {
      console.error('Edit error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Edit failed. Please try again.';
      alert(message);
      await fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const closeEditModal = () => {
    setEditModal({
      show: false,
      clientId: null,
      firstname: '',
      middlename: '',
      lastname: '',
      email: '',
      contact_number: '',
      valid_id: null,
      profile_image: null,
      valid_id_preview: null,
      profile_image_preview: null,
    });
  };

  const openDeleteModal = (clientId, clientName) => {
    setDeleteModal({ show: true, clientId, clientName });
  };

  // 🔔 FIX #2: Enhanced delete confirmation with clear alert message
  const handleDeleteConfirm = async () => {
    setProcessingId(deleteModal.clientId);
    try {
      const { data } = await deleteClient(deleteModal.clientId);
      setAllClients(prev => prev.filter(c => c.id !== deleteModal.clientId));
      setDeleteModal({ show: false, clientId: null, clientName: '' });
      
      // Clear, prominent alert message on successful delete
      const successMessage = data?.message || `Client "${deleteModal.clientName}" has been deleted successfully!`;
      alert(successMessage);
      
    } catch (error) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Delete failed. Please try again.';
      alert(`❌ ${message}`);
      await fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Filtering is reactive via useMemo, no additional action needed
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // --- UI Helpers ---
  const counterColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    all: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  };

  const tabs = [
    { key: 'pending', label: 'Pending', icon: FaUserClock, count: pendingClients.length },
    { key: 'approved', label: 'Approved', icon: FaUserCheck, count: approvedClients.length },
    { key: 'rejected', label: 'Rejected', icon: FaTimes, count: rejectedClients.length },
    { key: 'all', label: 'All Clients', icon: FaUsers, count: filteredAllClients.length },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderTable = (clients, showRejectionReason = false) => {
    if (clients.length === 0) {
      return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            <tr>
              <td
                colSpan={showRejectionReason ? 8 : 7}
                className="px-6 py-12 text-center text-gray-500 dark:text-slate-400"
              >
                {searchTerm ? 'No clients match your search' : 'No clients in this category'}
                {searchTerm && (
                  <button 
                    onClick={handleSearchClear}
                    className="ml-2 text-green-600 hover:underline dark:text-green-400"
                  >
                    Clear search
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Valid ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Status
            </th>
            {showRejectionReason && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
                Rejection Reason
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Registered
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
              <td
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => openViewModal(client)}
              >
                <div className="flex items-center">
                  {client.profile_image_url ? (
                    <img
                      src={client.profile_image_url}
                      alt={client.firstname}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${client.account_status === 'approved'
                        ? 'bg-blue-100 dark:bg-blue-500/20'
                        : client.account_status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-500/20'
                          : 'bg-yellow-100 dark:bg-yellow-500/20'
                        }`}
                    >
                      <span
                        className={`font-medium text-sm ${client.account_status === 'approved'
                          ? 'text-blue-700 dark:text-blue-300'
                          : client.account_status === 'rejected'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                          }`}
                      >
                        {client.firstname?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-900 font-medium dark:text-slate-200">
                    {client.firstname} {client.middlename ? client.middlename + ' ' : ''}
                    {client.lastname}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                {client.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                {client.contact_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                {client.valid_id_url ? (
                  <a
                    href={client.valid_id_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    title="View Valid ID"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </a>
                ) : (
                  <span className="text-gray-400 dark:text-slate-500">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getStatusBadge(client.account_status)}
              </td>
              {showRejectionReason && (
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate dark:text-slate-400">
                  {client.rejection_reason || '—'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-500">
                {formatDate(client.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                {client.account_status === 'pending' ? (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleApprove(client.id)}
                      disabled={processingId === client.id}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                      title="Approve"
                    >
                      {processingId === client.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(client.id)}
                      disabled={processingId === client.id}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                      title="Reject"
                    >
                      {processingId === client.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEditModal(client)}
                      disabled={processingId === client.id}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      {processingId === client.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaEdit />
                      )}
                     
                    </button>
                    <button
                      onClick={() => openDeleteModal(client.id, `${client.firstname} ${client.lastname}`)}
                      disabled={processingId === client.id}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      {processingId === client.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                     
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 dark:border-green-400"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'pending':
        return renderTable(pendingClients);
      case 'approved':
        return renderTable(approvedClients);
      case 'rejected':
        return renderTable(rejectedClients, true);
      case 'all':
        return renderTable(filteredAllClients);
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 dark:bg-opacity-70">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-slate-100">Reject Client</h3>
            <p className="text-gray-600 mb-4 dark:text-slate-400">Please provide a reason for rejecting this client:</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              className="w-full h-32 bg-gray-50 border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-green-400"
              placeholder="Enter rejection reason..."
              disabled={processingId === rejectModal.clientId}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setRejectModal({ show: false, clientId: null, reason: '' })}
                disabled={processingId === rejectModal.clientId}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectModal.reason.trim() || processingId === rejectModal.clientId}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-700 dark:hover:bg-red-800 flex items-center gap-2"
              >
                {processingId === rejectModal.clientId && <FaSpinner className="animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.show && viewModal.client && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 dark:bg-opacity-70">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-slate-100">Client Details</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                {viewModal.client.profile_image_url ? (
                  <img
                    src={viewModal.client.profile_image_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center dark:bg-slate-700">
                    <FaImage className="h-8 w-8 text-gray-400 dark:text-slate-500" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">First Name</p>
                  <p className="font-medium dark:text-slate-200">{viewModal.client.firstname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Middle Name</p>
                  <p className="font-medium dark:text-slate-200">{viewModal.client.middlename || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Last Name</p>
                  <p className="font-medium dark:text-slate-200">{viewModal.client.lastname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
                  <p className="font-medium dark:text-slate-200">{viewModal.client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Contact Number</p>
                  <p className="font-medium dark:text-slate-200">{viewModal.client.contact_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Status</p>
                  <p className="font-medium">{getStatusBadge(viewModal.client.account_status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Registered</p>
                  <p className="font-medium dark:text-slate-200">{formatDate(viewModal.client.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Approved At</p>
                  <p className="font-medium dark:text-slate-200">{formatDate(viewModal.client.approved_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Rejected At</p>
                  <p className="font-medium dark:text-slate-200">{formatDate(viewModal.client.rejected_at)}</p>
                </div>
                {viewModal.client.rejection_reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-slate-400">Rejection Reason</p>
                    <p className="font-medium dark:text-slate-200">{viewModal.client.rejection_reason}</p>
                  </div>
                )}
              </div>

              {viewModal.client.valid_id_url && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Valid ID</p>
                  <a
                    href={viewModal.client.valid_id_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    <FaDownload className="mr-2" /> View / Download
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewModal({ show: false, client: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 dark:bg-opacity-70">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-slate-100">Edit Client</h3>
            <div className="space-y-4">
              {editModal.profile_image_preview && (
                <div className="flex justify-center mb-4">
                  <img
                    src={editModal.profile_image_preview}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={editModal.firstname}
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                  disabled={processingId === editModal.clientId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Middle Name</label>
                <input
                  type="text"
                  name="middlename"
                  value={editModal.middlename}
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                  disabled={processingId === editModal.clientId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={editModal.lastname}
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                  disabled={processingId === editModal.clientId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editModal.email}
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                  disabled={processingId === editModal.clientId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Contact Number</label>
                <input
                  type="text"
                  name="contact_number"
                  value={editModal.contact_number}
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-blue-400"
                  disabled={processingId === editModal.clientId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Valid ID (leave empty to keep current)</label>
                <input
                  type="file"
                  name="valid_id"
                  accept=".jpeg,.jpg,.png,.pdf"
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  disabled={processingId === editModal.clientId}
                />
                {editModal.valid_id_preview && !editModal.valid_id && (
                  <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">Current file: {editModal.valid_id_preview.split('/').pop()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Profile Image</label>
                <input
                  type="file"
                  name="profile_image"
                  accept=".jpeg,.jpg,.png"
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  disabled={processingId === editModal.clientId}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeEditModal}
                disabled={processingId === editModal.clientId}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleEditConfirm}
                disabled={!editModal.firstname.trim() || !editModal.lastname.trim() || !editModal.email.trim() || processingId === editModal.clientId}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2"
              >
                {processingId === editModal.clientId && <FaSpinner className="animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 dark:bg-opacity-70">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-slate-100">Delete Client</h3>
            <p className="text-gray-600 mb-4 dark:text-slate-400">
              Are you sure you want to delete <span className="font-semibold">{deleteModal.clientName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, clientId: null, clientName: '' })}
                disabled={processingId === deleteModal.clientId}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={processingId === deleteModal.clientId}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-700 dark:hover:bg-red-800 flex items-center gap-2"
              >
                {processingId === deleteModal.clientId && <FaSpinner className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Search */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="px-4 pt-4 pb-2 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Client Management</h2>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email"
                className="w-full bg-white border border-gray-300 rounded pl-10 pr-8 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:border-green-400"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                  title="Clear search"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="flex border-b border-gray-200 overflow-x-auto dark:border-slate-700">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${index !== tabs.length - 1 ? 'border-r border-gray-200 dark:border-slate-700' : ''
                } ${activeTab === tab.key
                  ? 'text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
                }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${counterColors[tab.key]}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">{renderContent()}</div>
      </div>
    </div>
  );
}