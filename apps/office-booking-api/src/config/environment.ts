export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    endpoints: {
        auth: {
            login: '/auth/login',
            refresh: '/auth/refresh',
        },
        users: {
            me: '/users/me',
            profile: '/users/profile',
        },
        bookings: {
            list: '/bookings',
            myBookings: '/bookings/my-bookings',
        },
        cabins: {
            list: '/cabins',
        }
    }
};