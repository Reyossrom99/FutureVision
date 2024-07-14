import React, {createContext, useContext, useState} from "react";

const SaveDatasetContext = createContext();

export function useSaveDatasetContext() {
    return useContext(SaveDatasetContext);
}

export function SaveDatasetProvider({children}) {
    const [confirmSaveDataset, setConfirmSaveDataset] = useState(false);

    const askForConfirmationSaveDataset= () => {
        setConfirmSaveDataset(true);
    }
    const saveConfirmationSaveDataset= () => {
        setConfirmSaveDataset(false)
    }
    return (
        <SaveDatasetContext.Provider value={{confirmSaveDataset, askForConfirmationSaveDataset, saveConfirmationSaveDataset}}>
            {children}
        </SaveDatasetContext.Provider>
    );
}
