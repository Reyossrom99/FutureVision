import React, {createContext, useContext, useState} from "react";

const DeleteDatasetContext = createContext();

export function useDeleteDatasetContext() {
  return useContext(DeleteDatasetContext);
}

export function DeleteDatasetProvider({children}) {
  const [confirmDeleteDataset, setConfirmDeleteDataset] = useState(false);

  const askForConfirmation= () => {
    setConfirmDeleteDataset(true);
  }
  const deleteConfirmation = () => {
    setConfirmDeleteDataset(false)
  }
  return (
    <DeleteDatasetContext.Provider value={{confirmDeleteDataset, askForConfirmation, deleteConfirmation}}>
      {children}
    </DeleteDatasetContext.Provider>
  );
}

const DeleteProjectContext = createContext();

export function useDeleteProjectContext() {
  return useContext(DeleteProjectContext);
}

export function DeleteProjectProvider({children}) {
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  const askForConfirmationProject= () => {
    setConfirmDeleteProject(true);
  }
  const deleteConfirmationProject = () => {
    setConfirmDeleteProject(false)
  }
  return (
    <DeleteProjectContext.Provider value={{confirmDeleteProject, askForConfirmationProject, deleteConfirmationProject}}>
      {children}
    </DeleteProjectContext.Provider>
  );
}