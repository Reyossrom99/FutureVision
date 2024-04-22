import { Navigate, Route } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({children}) => {
    const { user } = useContext(AuthContext);
    const currentPath = window.location.pathname;

    if (!user && currentPath !== '/signup') {
        return <Navigate to='/login' />;
    }

   return children; 
}

export default PrivateRoute;
