import React, {createContext, useContext, useState} from "react";

const ModifyContext= createContext();

export function useModifyContext() {
  return useContext(ModifyContext);
}
export function ModifyProvider({children}) {
    const [modify, setModify] = useState(false);
    const [isModifyDialogOpen, SetIsModifyDialogOpen] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [description, setDescription] = useState('');
    
    const askForModify = () => {
        setModify(true);
        SetIsModifyDialogOpen(true);
    }
    const handleCloseModifyDialog = () => {
        setModify(false); 
        SetIsModifyDialogOpen(false);
    }
    return (
        <ModifyContext.Provider value={{modify, isModifyDialogOpen, privacy, description, askForModify, handleCloseModifyDialog, setDescription, setPrivacy, setModify}}>
        {children}
        </ModifyContext.Provider>
    );
    }
