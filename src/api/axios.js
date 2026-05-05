import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR (Attach Token)
|--------------------------------------------------------------------------
*/

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/*
|--------------------------------------------------------------------------
| CONTACT
|--------------------------------------------------------------------------
*/

export const sendContact = (data) => api.post("/contact", data);

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

export const register = (data) => api.post("/auth/register", data);

export const login = (data) => api.post("/auth/login", data);

export const getMe = () => api.get("/auth/me");

export const logout = () => api.post("/auth/logout");

export const updateProfile = (data) => api.post('/auth/profile', data);

export const getMyActivity = () => api.get("/auth/my-activity");

export const getAdmins = () => api.get('/auth/admins');

/*
|--------------------------------------------------------------------------
| ADMIN AUTH
|--------------------------------------------------------------------------
*/

export const getPendingClients = () => api.get("/auth/pending-clients");

export const getAllClients = (params = {}) =>
    api.get("/auth/clients", { params });

export const approveClient = (id) =>
    api.post(`/auth/approve-client/${id}`);

export const rejectClient = (id, data) =>
    api.post(`/auth/reject-client/${id}`, data);


export const editClient = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
    }
    return api.post(`/auth/clients/${id}`, data);
};

export const deleteClient = (id) =>
    api.delete(`/auth/clients/${id}`);

export const getActivityLogs = (params = {}) =>
    api.get("/auth/activity-logs", { params });

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const getNotifications = (page = 1, params = {}) =>
    api.get("/notifications", {
        params: {
            page,
            ...params,
        },
    });

export const getUnreadNotifications = () =>
    api.get("/notifications/unread");

export const markNotificationRead = (id) =>
    api.post(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
    api.post("/notifications/read-all");

export const getUnreadNotificationsCount = () =>
    api.get("/notifications/unread/count");

export const deleteNotification = (id) =>
    api.delete(`/notifications/${id}`);

/*
|--------------------------------------------------------------------------
| APPOINTMENTS 
|--------------------------------------------------------------------------
*/

export const getAppointments = (params = {}) => api.get("/appointments", { params });
export const getServices = () => api.get("/appointments/services");
export const createAppointment = (data) => api.post("/appointments", data);
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);
export const cancelAppointment = (id, data) => api.post(`/appointments/${id}/cancel`, data);

/*
|--------------------------------------------------------------------------
| SCHEDULES (admin only)
|--------------------------------------------------------------------------
*/

export const getSchedules = () => api.get("/schedules");
export const createSchedule = (data) => api.post("/schedules", data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);

/*
|--------------------------------------------------------------------------
| EXCEPTIONS (admin only)
|--------------------------------------------------------------------------
*/


export const getExceptions = () => api.get("/exceptions");
export const createException = (data) => api.post("/exceptions", data);
export const updateException = (id, data) => api.put(`/exceptions/${id}`, data);
export const deleteException = (id) => api.delete(`/exceptions/${id}`);

/*
|--------------------------------------------------------------------------
| AVAILABILITY ( client & admin)
|--------------------------------------------------------------------------
*/

export const getAvailableSlots = (startDate, endDate) =>
    api.get("/appointments/available-slots", {
        params: { start_date: startDate, end_date: endDate },
    })

/*


/*
|--------------------------------------------------------------------------
| PROJECTS
|--------------------------------------------------------------------------
*/

export const getProjects = () =>
    api.get("/projects");

export const createProject = (data) =>
    api.post("/projects", data);

export const getProject = (id) =>
    api.get(`/projects/${id}`);

export const updateProject = (id, data) =>
    api.put(`/projects/${id}`, data);

export const addProjectImages = (id, data) =>
    api.post(`/projects/${id}/images`, data);

export const deleteProjectImage = (id) =>
    api.delete(`/projects/images/${id}`);

export const deleteProject = (id) =>
    api.delete(`/projects/${id}`);

export default api;