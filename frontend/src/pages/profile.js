import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link
import styles from './profile.module.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/profile'); // Assuming the endpoint to fetch user data is /api/user
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
       
        {userData && (
          <div>
             <h2>User Information</h2>
            <p>Username: {userData.username}</p>
            <p>Email: {userData.email}</p>
            <p></p>
          </div>
        )}
      </div>
      {userData && userData.group === 'admin' && ( // Render the link conditionally
        <div className={styles.bottomLinkContainer}>
          <Link to="/new-user" className={styles.signUp}>add a new user</Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
