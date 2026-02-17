export const API_BASE_URL = 'http://localhost:8080';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    USER: {
        PROFILE: '/api/profile',
        SEARCH: '/api/users/search',
    },
    STUDENTS: {
        LIST: '/api/students',
        CREATE: '/api/students',
        SEARCH: '/api/students/search',
    },
    FOLLOWUPS: {
        LIST: '/api/followups',
        DETAILS: (id: number) => `/api/followups/${id}`,
        CREATE: '/api/followups',
        RESTART: (id: number) => `/api/followups/${id}/restart`,
        CONTACTS: {
            LIST: (id: number) => `/api/followups/${id}/contacts`,
            CREATE: (id: number) => `/api/followups/${id}/contacts`,
        },
        MEETINGS: {
            LIST: (id: number) => `/api/followups/${id}/meetings`,
            CREATE: (id: number) => `/api/followups/${id}/meetings`,
        },
    },
    MEETINGS: {
        COMPLETE: (id: number) => `/api/meetings/${id}/complete`,
        OUTCOME: (id: number) => `/api/meetings/${id}/outcome`,
    },
    REMINDERS: {
        UPCOMING: '/api/reminders/upcoming',
    },
};
