import React from 'react';
import styles from './Login.module.css';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const LoginPage = () => {
    const navigate = useNavigate(); // Move useNavigate hook inside the component function
    const { loginUser } = useContext(AuthContext);

    const handleRedirect = () => {
        navigate('/sign-up');
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
            <h2>Log in</h2>
                <form onSubmit={loginUser}>
                <label>Enter username:</label>
                    <input type="text" placeholder="username" className={styles.inputField} /><br />
                    <label>Enter password:</label>
                    <input type="password" name="password" placeholder="password" className={styles.inputField} /><br />
                    <input type="submit" value='Log in' className={styles.loginButton} />
                    <input type="button" value='Sign up' className={styles.loginButton} onClick={handleRedirect} />
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
