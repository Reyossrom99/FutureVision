import React, { createContext, useContext, useState } from 'react';

const CheckboxContext = createContext();

export const CheckboxProvider = ({ children }) => {
  const [showLabels, setShowLabels] = useState(false);

  return (
    <CheckboxContext.Provider value={{ showLabels, setShowLabels }}>
      {children}
    </CheckboxContext.Provider>
  );
};

export const useCheckbox = () => {
  return useContext(CheckboxContext);
};