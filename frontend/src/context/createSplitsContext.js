import React, { useState, useContext } from 'react';

const CreateSplitContext = React.createContext();

export const useCreateSplitContext = () => {
  return useContext(CreateSplitContext);
};

export const ButtonClickProvider = ({ children }) => {
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleButtonClick = () => {
    setButtonClicked(true);
  };

  return (
    <CreateSplitContext.Provider value={{ buttonClicked, handleButtonClick }}>
      {children}
    </CreateSplitContext.Provider>
  );
};
