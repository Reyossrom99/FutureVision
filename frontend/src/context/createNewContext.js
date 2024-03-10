import React, { createContext, useContext, useState } from 'react';

const CreateNewButtonContext = createContext();

export function useCreateNewButtonContext() {
  return useContext(CreateNewButtonContext);
}

export function CreateNewButtonProvider({ children }) {
  const [isNewButtonClicked, setNewButtonClicked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleNewButtonClick = () => {
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

// Create new project 
const CreateNewProjectContext = createContext(); 
export function useCreateNewProjectContext() {
  return useContext(CreateNewProjectContext); 
}

export function CreateNewProjectProvider ({ children }) {
  const [isProjectButtonClicked, setNewProjectClicked] = useState(false); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); 

  const handleNewProjectButtonClick = () => {
    setNewProjectClicked(true); 
    setIsDialogOpen(true); 
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <CreateNewProjectContext.Provider value={{ isDialogOpen, handleNewProjectButtonClick, handleCloseDialog }}>
      {children}
    </CreateNewProjectContext.Provider>
  );
}
