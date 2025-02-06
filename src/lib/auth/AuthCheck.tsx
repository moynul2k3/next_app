import axios from 'axios';
const API_URL = process.env.PRODUCTION === 'true' ? process.env.PRODUCTION_API : process.env.LOCAL_API;



export async function AuthCheck(accessToken:string, refreshToken:string): Promise<{authenticated:boolean, access: string | null; refresh: string | null }> {
    try {
        if (!accessToken || !refreshToken) {
            return {authenticated:false, access: null, refresh: null }; 
        } else {
            if (await verifyToken(accessToken)) {
                console.log('User is authenticated.')
                return {authenticated:true, access: null, refresh: null };
            }
            const data = await refreshAccessToken(refreshToken);
            if (data.access && data.refresh) {
                if (await verifyToken(data.access)) {
                    console.log('User is authenticated.')
                    return {authenticated:true, access: data.access, refresh: data.refresh };
                }
            };
        }
    } catch (error) {
        console.error('Error during token verification:', error);
        return {authenticated:false, access: null, refresh: null };
    }
    console.log('User is not authenticated.')
    return {authenticated:false, access: null, refresh: null };
}

const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await axios.post(`${API_URL}/token/verify/`, { token });
        if (response.status === 200) {
            return true;
        }
        return false;
    } catch (error) {
        console.log('Error verifying token:', error);
        return false;
    }
};


const refreshAccessToken = async (refresh: string): Promise<{ access: string | null; refresh: string | null }> => {
    try {
        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh });
        if (response.status === 200) {
            return { access: response.data.access, refresh: response.data.refresh };
        }
        return { access: null, refresh: null };
    } catch (error) {
        console.log('Error refreshing access token:', error);
        return { access: null, refresh: null };
    }
};

// const verifyToken = async (token: string): Promise<boolean> => {
//     try {
//         const response = await fetch('http://127.0.0.1:8000/api/token/verify/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ token: token }),
//         });
//         return response.status === 200;
//     } catch (error) {
//         console.error('Error verifying token:', error);
//         return false;
//     }
// };

// const refreshAccessToken = async (refresh: string): Promise<{ access: string | null; refresh: string | null }> => {
//     try {
//         const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ refresh: refresh }),
//         });
//         if (response.ok) {
//             const data = await response.json();
//             return { access: data.access, refresh: data.refresh };
//         }
//         return { access: null, refresh: null };
//     } catch (error) {
//         console.error('Error refreshing access token:', error);
//         return { access: null, refresh: null };
//     }
// };
