import React, { useState, createContext, useContext } from 'react';

const SplitContext = createContext();

export const useSplitContext = () => {
  return useContext(SplitContext);
};

export const SplitProvider = ({ children }) => {
  const [selectedSplit, setSelectedSplit] = useState('');

  const setSplit = (split) => {
    setSelectedSplit(split);
  };

  return (
    <SplitContext.Provider value={{ selectedSplit, setSplit }}>
      {children}
    </SplitContext.Provider>
  );
};