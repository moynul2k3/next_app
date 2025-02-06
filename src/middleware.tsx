import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
// const API_URL = "http://127.0.0.1:8000/api"
const API_URL =
  process.env.PRODUCTION === "true"
    ? process.env.PRODUCTION_API
    : process.env.LOCAL_API;



export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('access')?.value || '';
    const refreshToken = request.cookies.get('refresh')?.value || '';
    const url = new URL(request.url);
    const prevHeader = request.headers.get('referer');
    const prevUrl = prevHeader ? new URL(prevHeader) : new URL('/');
    const response = NextResponse.next();

    try {
        if (!accessToken || !refreshToken) {
            if (prevUrl) {
                if (!prevUrl.searchParams.has('user_registration')) {
                    prevUrl.searchParams.set('user_registration', 'true');
                }
                if (!prevUrl.searchParams.has('next')) {
                    prevUrl.searchParams.set('next', url.pathname); // Set 'next' to the current path
                }
                return NextResponse.redirect(prevUrl.toString());
            }
        } else {
            if (await verifyToken(accessToken)) {
                return response;
            }
            const data = await refreshAccessToken(refreshToken);
            if (data.access && data.refresh) {
                response.cookies.set('access', data.access, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30 // 1 month
                });
                response.cookies.set('refresh', data.refresh, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30 // 30 days
                });
                await verifyToken(data.access);
                return response;
            } else {
                if (prevUrl) {
                    if (!prevUrl.searchParams.has('user_registration')) {
                        prevUrl.searchParams.set('user_registration', 'true');
                    }
                    if (!prevUrl.searchParams.has('next')) {
                        prevUrl.searchParams.set('next', url.pathname); 
                    }
                    return NextResponse.redirect(prevUrl.toString());
                }
            }
        }

    } catch (error) {
        console.error('Error during token verification:', error);
        return response;
    }
    return response;
}

const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/token/verify/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
};

const refreshAccessToken = async (refresh: string): Promise<{ access: string | null; refresh: string | null }> => {
    try {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refresh }),
        });
        if (response.ok) {
            const data = await response.json();
            return { access: data.access, refresh: data.refresh };
        }
        return { access: null, refresh: null };
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return { access: null, refresh: null };
    }
};


export const config = {
    matcher: ['/products'],
    runtime: 'nodejs'
};
