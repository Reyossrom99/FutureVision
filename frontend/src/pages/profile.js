import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './Profile.module.css';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { authTokens, logoutUser } = useContext(AuthContext);
    const [profile, setProfile] = useState({});
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const response = await fetch('/auth/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens.access)
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            } else if (response.status === 401) {
                logoutUser();
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleEditFieldClick = (fieldName) => {
        switch (fieldName) {
            case 'username':
                setIsEditingUsername(true);
                break;
            case 'email':
                setIsEditingEmail(true);
                break;
            case 'password':
                setIsEditingPassword(true);
                break;
            default:
                break;
        }
    };

    const handleSaveClick = async (fieldName) => {
        try {
            const response = await fetch(`auth/user/modify?field=${fieldName}&id=${profile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify({ value: newValue })
            });
            if (response.ok) {
                // Actualizar el perfil con el nuevo valor
                setProfile(prevProfile => ({ ...prevProfile, [fieldName]: newValue }));
                // Resetear el estado
                setNewValue('');
                setIsEditingUsername(false);
                setIsEditingEmail(false);
                setIsEditingPassword(false);
                setError('');
            } else {
                const data = await response.json();
                setError(data.error);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Error updating profile. Please try again later.');
        }
    };

    const handleInputChange = (event) => {
        setNewValue(event.target.value);
    };

    const handleCancelEdit = () => {
        setIsEditingUsername(false);
        setIsEditingEmail(false);
        setIsEditingPassword(false);
        setError('');
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h2>Profile</h2>
                {error && <p className={styles.error}>{error}</p>}
                <table className={styles.profileTable}>
                    <tbody>
                        <tr>
                            <td>Username:</td>
                            <td>
                                {profile.username}
                            </td>
                            <td>
                                {!isEditingUsername && (
                                    <button className={styles.editButton} onClick={() => handleEditFieldClick('username')}>Edit</button>
                                )}
                            </td>
                        </tr>
                        {isEditingUsername && (
                            <tr className={styles.editRow}>
                                <td>Change username:</td>
                                <td>
                                    <input
                                        type="text"
                                        value={newValue}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        id={styles.unico}
                                    />
                                    <button onClick={() => handleSaveClick('username')}className={styles.editButton}>Save</button>
                                    <button onClick={handleCancelEdit}className={styles.editButton}>Cancel</button>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>Email:</td>
                            <td>
                                {profile.email}
                            </td>
                            <td>
                                {!isEditingEmail && (
                                    <button className={styles.editButton} onClick={() => handleEditFieldClick('email')}>Edit</button>
                                )}
                            </td>
                        </tr>
                        {isEditingEmail && (
                            <tr className={styles.editRow}>
                                <td>Change email:</td>
                                <td>
                                    <input
                                        type="email"
                                        value={newValue}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        id={styles.unico}
                                    />
                                    <button onClick={() => handleSaveClick('email')}className={styles.editButton}>Save</button>
                                    <button onClick={handleCancelEdit}className={styles.editButton}>Cancel</button>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>Password:</td>
                            <td>
                                {!isEditingPassword ? '********' : (
                                    <>
                                        <input
                                            type="password"
                                            value={newValue}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                            id={styles.unico}
                                        />
                                        <button onClick={() => handleSaveClick('password')}className={styles.editButton}>Save</button>
                                        <button onClick={handleCancelEdit}className={styles.editButton}>Cancel</button>
                                    </>
                                )}
                            </td>
                            <td colSpan="2" >
                                {!isEditingPassword && (
                                    <button className={styles.editButton} onClick={() => handleEditFieldClick('password')}>Edit</button>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>Rol:</td>
                            <td>{profile.grupo}</td>
                        </tr>
                    </tbody>
                </table>
                <div className={styles.bottomLinkContainer}>
                    {profile.grupo === 'admin' && (
                        <><Link to="/user/new" className={styles.adminLink}>Create new user</Link>
                        <Link to="/users" className={styles.adminLink}>View all users</Link></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
