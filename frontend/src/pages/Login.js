import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/auth/login', { username, password });
      // Assuming that a successful login returns a status code of 200
      if (response.status === 200) {
        // Assuming that the server returns some data indicating a successful login
        if (response.data && response.data.message === 'Login successful') {
          // Login successful, update the state to indicate the user is logged in
          onLogin();
        } else {
          // If the server response indicates an error, set the error message accordingly
          setError('Invalid credentials');
        }
      } else {
        // If the response status is not 200, handle error
        setError('An error occurred during login');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;

