// 1. Set the base URL — so you never repeat http://localhost:8000
// 2. Attach JWT token to every request automatically — interceptor
// 3. Handle 401 responses globally — token expired, redirect to login

import axios from 'axios'

const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL   // we put a base url so that we dont have to write common part again and again 
});

// interceptors task  - (to access protected routes after login)attach token before every request 
api.interceptors.request.use((config)=>{
    // get token from localStorage - localStorage is browser persistent storage (survives even browser restart)
    // if exists — attach to Authorization header
    // return config
    const token = localStorage.getItem('token'); 

    // we check is token exists
    if(token){
        config.headers.Authorization = `Bearer ${token}`; // attach Authorization header to outgoing request 
    }
    return config; // returning the config after modification - config basically is data bundled together 

});

// centralized 401(authentication failure)  error handling 
api.interceptors.response.use(
    (response)=>response,  // success  - just return it 
    (error) => {
        // if 401 — token expired — clear storage, redirect to login
        if(error.response && error.response.status === 401){
            localStorage.removeItem('token'); // remove the expired token 
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        // Free-plan limits send users to the upgrade screen with the limit that was reached.
        if (
            error.response?.status === 403 &&
            error.response?.data?.code === 'FREE_PLAN_LIMIT_REACHED' &&
            window.location.pathname !== '/subscribe'
        ) {
            const { resource, limit } = error.response.data;
            window.location.href = `/subscribe?reason=free-limit&resource=${encodeURIComponent(resource)}&limit=${encodeURIComponent(limit)}`;
        }
        return Promise.reject(error);
    }
)

export default api;
