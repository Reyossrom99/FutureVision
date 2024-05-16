import React, {createContext, useContext, useState} from "react"; 

const CreateSplitContext = createContext(); 

export function useCreateSplitContext (){
  return useContext(CreateSplitContext); 
}; 

export function CreateSplitProvider({children}){
  const [isCreateSplitDialogOpen, SetCreateSplitDialogOpen] = useState(false); 

  const handleCreateSplitDialog = () => {
    SetCreateSplitDialogOpen(true); 
  }
  const handleCloseCreateSplitDialog = () => {
    SetCreateSplitDialogOpen(false); 
  }
     return (
        <CreateSplitContext.Provider value={{handleCloseCreateSplitDialog, handleCreateSplitDialog, isCreateSplitDialogOpen}}>
        {children}
        </CreateSplitContext.Provider>
    );
}