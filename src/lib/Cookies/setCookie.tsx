import { setCookie } from 'cookies-next';

interface AuthCookies {
    access: string;
    refresh: string;
}

export const setAuthCookies = ({ access, refresh }: AuthCookies) => {
    setCookie('access', access, {
        httpOnly: false,
        secure: true, 
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    setCookie('refresh', refresh, {
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    console.log('Cookies are set');
};
