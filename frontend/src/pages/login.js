import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './Login.module.css';
import { ErrorMessage, Form, LinkForm, Input, Title, SubmitInput} from '../elements/formSyles';
import {LoginContainer} from '../elements/containers';

const LoginPage = () => {
    const { loginUser, error, setError } = useContext(AuthContext); 

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(e);
        setError(null);
    };

    return (
        <LoginContainer>
                
                <Form onSubmit={handleSubmit}>
                    <Title>Welcome back!</Title>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <Input type="text" name="username" placeholder="username" />
                    <Input type="password" name="password" placeholder="password" />
                    <SubmitInput type="submit" value="login" /> 
                    <LinkForm to="/signup">Create a new account</LinkForm> 
                </Form>
            
        </LoginContainer>
    );
}

export default LoginPage;
