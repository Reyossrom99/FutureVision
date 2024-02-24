import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './Login.module.css';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    let { loginUser, error } = useContext(AuthContext); 

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h2>Log in</h2>
                <form onSubmit={loginUser}>
                    <p>Enter username: </p>
                    <input type="text" name="username" placeholder="Enter username" /><br></br>
                    <p>Enter password: </p>
                    <input type="password" name="password" placeholder="enter password" /><br></br>
                    <input type="submit" className={styles.loginButton} value="Log in" /> <br></br>
                    {error && <p className={styles.error}>{error}</p>}
                    <Link to="/register" className={styles.signUp}>Create a new account</Link> {/* Link to the register page */}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
