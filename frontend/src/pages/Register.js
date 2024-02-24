import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/sign-up/', formData)
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
                <h2>Sing up</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Enter username:</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Enter password:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    </div>
                    <input type="submit" value='Sign up' className={styles.signUp} />
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
