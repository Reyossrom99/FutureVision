import React, { useContext} from 'react';
import AuthContext from '../context/AuthContext';
import { ErrorMessage, Form, LinkForm, Input, Title, SubmitInput} from '../elements/formSyles';
import {LoginContainer} from '../elements/containers';

const LoginPage = () => {
    const { loginUser, error, setError } = useContext(AuthContext); 

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(e);
    };

    return (
        <LoginContainer>
                
                <Form onSubmit={handleSubmit}>
                    <Title>Welcome back!</Title>
                    <Input type="text" name="username" placeholder="username" /> n
                    <Input type="password" name="password" placeholder="password" />
                    <SubmitInput type="submit" value="login" /> 
                    <LinkForm to="/signup">Create a new account</LinkForm> 
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Form>
            
        </LoginContainer>
    );
}

export default LoginPage;
