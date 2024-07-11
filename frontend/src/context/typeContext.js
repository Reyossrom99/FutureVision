import React, { useState, createContext, useContext } from 'react';

const TypeContext = createContext();

export const useTypeContext = () => {
  return useContext(TypeContext);
};

export const TypeProvider = ({ children }) => {
  const [type, setType] = useState('');


  return (
    <TypeContext.Provider value={{ type, setType}}>
      {children}
    </TypeContext.Provider>
  );
};
