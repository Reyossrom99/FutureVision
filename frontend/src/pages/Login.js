import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './Login.module.css';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const { loginUser, error, setError } = useContext(AuthContext); 


    // Limpiar el error al enviar el formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(e);
        setError(null);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h2>Log in</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.error}>{error}</p>}
                    <p className={styles.p}>Enter username: </p>
                    <input type="text" name="username" placeholder="Enter username" /><br></br>
                    <p className={styles.p}>Enter password: </p>
                    <input type="password" name="password" placeholder="enter password" /><br></br>
                    <input type="submit" className={styles.loginButton} value="Log in" /> <br></br>
                    
                    <Link to="/sign-up" className={styles.signUp}>Create a new account</Link> {/* Link to the register page */}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;