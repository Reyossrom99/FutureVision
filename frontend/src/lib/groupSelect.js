import React from 'react';
import { Input } from '../elements/table'; // Asegúrate de que este import sea correcto
const GroupSelect = ({ group, onChange }) => {
  const groups = ['user', 'admin']; // Define los grupos disponibles

  // Asegúrate de que 'group' tenga un valor válido
  const validGroup = groups.includes(group) ? group : 'user'; // Valor por defecto

  // Ordena las opciones para que la opción seleccionada esté al principio
  const sortedGroups = [validGroup, ...groups.filter(g => g !== validGroup)];

  return (
    <Input
      as="select"
      value={validGroup} // Asegúrate de que el valor sea uno de los grupos válidos
      onChange={onChange}
    >
      {sortedGroups.map(g => (
        <option key={g} value={g}>
          {g.charAt(0).toUpperCase() + g.slice(1)} {/* Capitaliza la primera letra */}
        </option>
      ))}
    </Input>
  );
};
export default GroupSelect;
