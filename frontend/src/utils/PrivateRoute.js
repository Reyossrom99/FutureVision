import { Navigate, Route } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({children, ...rest}) => {
    const { user } = useContext(AuthContext);
    const currentPath = window.location.pathname;

    // If the user is not authenticated and the current route is not /register, redirect to /login
    if (!user && currentPath !== '/sign-up') {
        return <Navigate to='/login' />;
    }

    // Allow access to the route element if the user is authenticated or the current route is /register
   return children; 
}

export default PrivateRoute;
