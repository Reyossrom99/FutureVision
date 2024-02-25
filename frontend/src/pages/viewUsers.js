import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import styles from './viewUsers.module.css';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/auth/users', {
          method: 'GET', 
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + String(authTokens.access)
          }
      });
      if (response.ok) {
          const data = await response.json();
          setUsers(data.usuarios); // Actualizar el estado con la lista de usuarios obtenida
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
      const response = await fetch(`/auth/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });
      if (response.ok) {
        // Actualizar la lista de usuarios después de la eliminación
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
      } else {
        // Manejar errores
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
      const response = await fetch(`/auth/user/modify?field=group&id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access)
        },
        body: JSON.stringify({ value: selectedGroup }) // Removido el campo 'field' ya que el endpoint asume 'group'
      });
      if (response.ok) {
        // Actualizar la lista de usuarios con el grupo actualizado
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, group: selectedGroup } : user
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
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.group}
                    onChange={(event) => handleGroupChange(event, user.id)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => confirmarEliminarUsuario(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewUsers;
