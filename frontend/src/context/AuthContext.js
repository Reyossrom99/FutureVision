import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [user, setUser] = useState(() => (localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null));
    let [authTokens, setAuthTokens] = useState(() => (localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null));
    let [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState(null); // Variable para almacenar errores

    let loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authTokens', JSON.stringify(data));
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                navigate('/datasets');
            } else {
                setError(data.detail); // Almacenar el detalle del error en la variable error
            }
        } catch (error) {
            console.error('Error while logging in:', error);
            setError('Something went wrong while logging in.'); // Almacenar un mensaje genérico en caso de error
        }
    };

    let logoutUser = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://127.0.0.1:8000/auth/token/blacklist/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                }, 
                body: JSON.stringify({ "refresh": authTokens.refresh })
            });
        } catch (error) {
            console.error('Error while logging out:', error);
        }
        if (localStorage.getItem('authTokens')) {
            localStorage.removeItem('authTokens');
        }
        setAuthTokens(null);
        setUser(null);
        navigate('/login');
    };


    const updateToken = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: authTokens?.refresh })
            });

            const data = await response.json();
            if (response.ok) {
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error('Error while updating token:', error);
            logoutUser(); // En caso de error, realizar logout
        }

        if (loading) {
            setLoading(false);
        }
    };

    let contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        error: error, // Pasar la variable error en el contexto
        setError : setError
    };
    

    useEffect(() => {
        if (authTokens) {
            const intervalId = setInterval(() => {
                updateToken();
            }, 1000 * 60 * 4); // Actualiza el token cada 4 minutos

            return () => clearInterval(intervalId);
        }
    }, [authTokens]);

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
