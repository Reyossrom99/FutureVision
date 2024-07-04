import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SingupContainer } from '../elements/containers';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorMessage, Form, Input, Title, SubmitInput, Select, Option, LinkForm } from '../elements/formSyles';
const SignupPage = () => {
    const navigate = useNavigate();
    //Default values 
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/auth/signup', formData)
            .then(response => {
                console.log(response.data);
                navigate("/login")
            })
            .catch(error => {
                console.error(error);
                setError(error.response.data.error);
            });
    };

    return (
        <SingupContainer>

            <Form onSubmit={handleSubmit}>

                <Title>Welcome!</Title>

                <Input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="username" />

                <Input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="email" />

                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="" disabled>Choose a role</option>
                    <option value="admin">Administrator</option>
                    <option value="user">User</option>
                </Select>

                <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="password" />

                <SubmitInput type="submit" value='signup' />
                <LinkForm to="/login">If you already have an account, log in.</LinkForm>
                {error && <ErrorMessage>{error}</ErrorMessage>}

            </Form>
        </SingupContainer>
    );
};

export default SignupPage;
