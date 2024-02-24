import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import AuthContext from '../context/AuthContext'; // Import AuthContext

const AddUserPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'  // Default role value, change as needed
    });
    const [error, setError] = useState('');

    // Access authTokens from AuthContext
    const { authTokens } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/new-user/', formData, {
            headers: {
                Authorization: `Bearer ${authTokens.access}`, // Include token in request headers
                'X-CSRFToken': getCookie('csrftoken') // Include CSRF token in request headers
            }
        })
        .then(response => {
            console.log(response.data); // handle successful registration
            // Optionally, navigate back to the login page or display a success message
            navigate("/profile")
        })
        .catch(error => {
            console.error(error); // handle registration error
            setError(error.response.data.error); // Set error message
        });
    };

    // Function to get CSRF token from cookies
    const getCookie = (name) => {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h2>Sign up</h2>
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
                    <input type="submit" value='Sign up' className={styles.loginButton} />
                    {error && <p className={styles.error}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AddUserPage;


