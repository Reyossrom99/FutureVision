import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PageTitle } from '../elements/title';
import {EditButton} from '../elements/button'; 
import {StyledLink} from '../elements/link'; 
import { ContentContainerCenter, PageContainer, BottomLinkContainer } from '../elements/containers';
import {TableContainer, StyledTable, TableBody, TableRow, TableCell,  Input} from '../elements/table'

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
            const response = await fetch('http://localhost:4004/auth/user', {
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
            const response = await fetch(`http://localhost:4004/auth/user/${profile.id}?field=${fieldName}`, {
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
<PageContainer>
   <PageTitle> Profile </PageTitle>
    <ContentContainerCenter>
      <TableContainer>
        <StyledTable>
          <TableBody>
            <TableRow>
              <TableCell>Username:</TableCell>
              <TableCell>
                {!isEditingUsername ? profile.username : (
                  <>
                    <Input
                      type="text"
                      value={newValue}
                      onChange={handleInputChange}
                    />
                    <EditButton onClick={() => handleSaveClick('username')}>save</EditButton>
                    <EditButton onClick={handleCancelEdit}>cancel</EditButton>
                  </>
                )}
              </TableCell>
              <TableCell>
                {!isEditingUsername && (
                  <EditButton onClick={() => handleEditFieldClick('username')}>edit</EditButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Email:</TableCell>
              <TableCell>
                {!isEditingEmail ? profile.email : (
                  <>
                    <Input
                      type="email"
                      value={newValue}
                      onChange={handleInputChange}
                    />
                    <EditButton onClick={() => handleSaveClick('email')}>save</EditButton>
                    <EditButton onClick={handleCancelEdit}>cancel</EditButton>
                  </>
                )}
              </TableCell>
              <TableCell>
                {!isEditingEmail && (
                  <EditButton onClick={() => handleEditFieldClick('email')}>edit</EditButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Password:</TableCell>
              <TableCell>
                {!isEditingPassword ? '********' : (
                  <>
                    <Input
                      type="password"
                      value={newValue}
                      onChange={handleInputChange}
                    />
                    <EditButton onClick={() => handleSaveClick('password')}>save</EditButton>
                    <EditButton onClick={handleCancelEdit}>cancel</EditButton>
                  </>
                )}
              </TableCell>
              <TableCell>
                {!isEditingPassword && (
                  <EditButton onClick={() => handleEditFieldClick('password')}>edit</EditButton>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Rol:</TableCell>
              <TableCell>{profile.grupo}</TableCell>
            </TableRow>
          </TableBody>
        </StyledTable>
      </TableContainer>
      <BottomLinkContainer>
        {profile.grupo === 'admin' && (
          <>
            <StyledLink to="/user/add">Create new user</StyledLink>
            <StyledLink to="/users">View all users</StyledLink>
          </>
        )}
      </BottomLinkContainer>
    </ContentContainerCenter>
  </PageContainer>
    );
};

export default Profile;
