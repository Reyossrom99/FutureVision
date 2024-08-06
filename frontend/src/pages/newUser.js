import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { NewUserContainer } from '../elements/containers';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorMessage, Form, Input, Title, SubmitInput, Select, Option, LinkForm } from '../elements/formSyles';
import {StyledLink} from '../elements/link'; 

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
            const response = await fetch(`http://localhost:4004/auth/user`, {
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
        <NewUserContainer>

            <Form onSubmit={handleSubmit}>

                <Title>Create new user</Title>

                <Input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="username" />

                <Input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="email" />

                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="" disabled>Choose a role</option>
                    <option value="admin">Administrator</option>
                    <option value="user">User</option>
                </Select>

                <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="password" />

                <SubmitInput type="submit" value='create user' />
                {error && <ErrorMessage>{error}</ErrorMessage>}
		<StyledLink to="/user"> Return </StyledLink>
            </Form>
        </NewUserContainer>
    );
};

export default NewUser;
