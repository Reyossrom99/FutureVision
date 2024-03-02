import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from './Login.module.css';

const NewUser = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin' // Default role value, change as needed
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        try {
            const response = await fetch(`/auth/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authContext.authTokens.access
                },
                body: JSON.stringify(formData) // Send the form data to the backend
            });
            if (response.ok) {
                navigate('/users'); // Navigate to success page or wherever you want
            } else {
                const data = await response.json();
                setError(data.error || 'Error creating user'); // Handle errors
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setError('Error creating user');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h2>Create new user</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Enter username:</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Enter email:</label>
                        <input type="text" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Select a role:</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="admin">Administrator</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <div>
                        <label>Enter password:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} />
                    </div>
                    <input type="submit" value="Sign up" className={styles.loginButton} />
                    {error && <p className={styles.error}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default NewUser;
