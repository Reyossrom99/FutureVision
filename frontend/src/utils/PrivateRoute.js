import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import AuthContext from '../context/AuthContext';
import { useContext } from 'react'
const PrivateRoute = ({children, ...rest}) => {
    let { user } = useContext(AuthContext)

    const currentPath = window.location.pathname;

   
    if (!user && currentPath !== '/register') {
        return <Navigate to='/login' />;
    }
    return children
}

export default PrivateRoute;