import React, { createContext, useContext, useState } from 'react';

const CreateNewButtonContext = createContext();

export function useCreateNewButtonContext() {
  return useContext(CreateNewButtonContext);
}

export function CreateNewButtonProvider({ children }) {
  const [isNewButtonClicked, setNewButtonClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to handle "Create New" button click
  const handleNewButtonClick = () => {
    // Implement any logic related to the "Create New" button click here
    console.log('Create New button clicked');
    setNewButtonClicked(true);
    setIsDialogOpen(true); 
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <CreateNewButtonContext.Provider value={{ isDialogOpen, handleNewButtonClick, handleCloseDialog }}>
      {children}
    </CreateNewButtonContext.Provider>
  );
}
