import { useEffect } from "react";
import axios from "axios";

export const Logout = () => {
    useEffect(() => {
        const logout = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:8000/auth/logout/',
                    {
                        refresh_token: localStorage.getItem('refresh_token')
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );

                localStorage.clear();
                axios.defaults.headers.common['Authorization'] = null;
                window.location.href = '/auth/login';
            } catch (error) {
                console.log('logout not working', error);
            }
        };

        logout();
    }, []);

    return (
        <div></div>
    );
};
