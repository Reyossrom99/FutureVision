import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link, useNavigate} from 'react-router-dom';
import { PageTitle } from '../elements/title';
import {EditButton} from '../elements/button'; 
import {StyledLink} from '../elements/link'; 
import { ContentContainer, PageContainer, BottomLinkContainer } from '../elements/containers';
import {TableContainer, StyledTable, TableBody, TableRow, TableCell,  Input, TableHeader, TableHeaderCell} from '../elements/table'
import GroupSelect from '../lib/groupSelect'; 

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const { authTokens, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4004/auth/users', {
          method: 'GET', 
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + String(authTokens.access)
          }
      });
      if (response.ok) {
          const data = await response.json();
          setUsers(data.users); // Actualizar el estado con la lista de usuarios obtenida
      } else {
          const data = await response.json();
          // Manejar errores
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const confirmarEliminarUsuario = async (userId) => {
    if (window.confirm('Do you want to delete this user?')) {
      eliminarUsuario(userId);
    }
  };

  const eliminarUsuario = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4004/auth/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });
      if (response.ok) {
        // Actualizar la lista de usuarios después de la eliminación
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
      } else if (response.status===401){
        logoutUser();
        navigate("/login"); 
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const handleGroupChange = async (event, userId) => {
    const selectedGroup = event.target.value;
    actualizarGrupoUsuario(userId, selectedGroup);
  };

  const actualizarGrupoUsuario = async (userId, selectedGroup) => {
    try {
      const response = await fetch(`http://localhost:4004/auth/user/${userId}?field=group`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access)
        },
        body: JSON.stringify({ value: selectedGroup }) 
      });
      if (response.ok) {
        // Actualizar la lista de usuarios con el grupo actualizado
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, grupo: selectedGroup } : user
        );
        setUsers(updatedUsers);
      } else {
        // Manejar errores
      }
    } catch (error) {
      console.error('Error actualizando grupo de usuario:', error);
    }
  };

  return (
<PageContainer>
  <PageTitle> Users </PageTitle>
  <ContentContainer>
    <TableContainer>
      <StyledTable>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Username</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Group</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.length > 0 ? (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                <Input
                    as="select"
                    value={user.grupo}
                    onChange={(event) => handleGroupChange(event, user.id)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </Input>
                </TableCell>
                <TableCell>
                  <EditButton onClick={() => confirmarEliminarUsuario(user.id)}>delete</EditButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5">There are no more users in the system</TableCell>
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
    </TableContainer>
  </ContentContainer>
</PageContainer>
  );
};

export default ViewUsers;
