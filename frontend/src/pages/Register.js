import React, { useContext, useEffect, useState} from 'react';
import styles from './Login.module.css';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin'  // Default role value, change as needed
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/auth/sign-up', formData)
            .then(response => {
                console.log(response.data); // handle successful registration
                // Optionally, navigate back to the login page or display a success message
                navigate("/login")
            })
            .catch(error => {
                console.error(error); // handle registration error
                setError(error.response.data.error); // Set error message
            });
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h2>Sign up</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Enter username:</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className={styles.input} id={styles.email}/>
                    </div>
                    <div>
                        <label>Enter email:</label>
                        <input type="text" name="email" value={formData.email} onChange={handleChange} className={styles.input} id={styles.email}/>
                    </div>
                    <div>
                        <label>Select a role:</label>
                        <select name="role" value={formData.role} onChange={handleChange}className={styles.input}>
                            <option value="admin">Administrator</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <div>
                        <label>Enter password:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange}className={styles.input}id={styles.email} />
                    </div>
                    <input type="submit" value='Sign up' className={styles.loginButton} />
                    {error && <p className={styles.error}>{error}</p>}
                </form>
               
            </div>
        </div>
    );
};

export default RegisterPage;