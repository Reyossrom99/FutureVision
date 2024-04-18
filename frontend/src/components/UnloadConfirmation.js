import React, { useEffect, useState, useContext} from 'react';
import AuthContext from '../context/AuthContext';

const UnloadConfirmation = () =>{
    const { authTokens, logoutUser } = useContext(AuthContext);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
          e.preventDefault();
          const confirmationMessage = '¿Estás seguro de que quieres cerrar?';
          e.returnValue = confirmationMessage;
          return confirmationMessage;
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, []);
    
      useEffect(() => {
        const handleLogout = async () => {
          // Realizar el proceso de logout cuando se confirma el cierre
          await logoutUser();
        };
    
        window.addEventListener('unload', handleLogout);
    
        return () => {
          window.removeEventListener('unload', handleLogout);
        };
      }, [logoutUser]);
    
      return null; 
}; 
export default UnloadConfirmation; 